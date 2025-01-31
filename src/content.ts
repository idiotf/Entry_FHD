declare global {
  var r: number | undefined
}

interface EntryGlobal {
  dispatchEvent(event: string, object: Entity): void
  type: string
  options: {
    useWebGL?: boolean
  }
  requestUpdate: boolean
  container: {
    selectObject(id: string): void
    objects_: {
      entity: {
        object: StageObject
      }
    }[]
  }
  stage?: Stage
}

interface Stage {
  updateObject(): void
  isEntitySelectable(): boolean
  update(): void
  handle: Handle
  variableContainer: {
    children: StageObject[]
  }
  isObjectClick: boolean
  inputField: InputField | null
  canvas: {
    x: number
    y: number
    canvas: HTMLCanvasElement
  }
  _app: {
    render?(): void
    stage: {
      update?(): void
      x: number
      y: number
      scaleX: number
      scaleY: number
    }
    screen?: Resizable
    renderer?: {
      resize(width: number, height: number): void
      options: Resizable
    }
  }
}

interface InputField {
  _isHidden: boolean
  _x: number
  _y: number
  getPixiView(): {
    scale: Settable
    position: Settable
  }
  x(data: number): void
  y(data: number): void
  width(): number
  width(data: number): void
  height(data: number): void
  padding(data: number): void
  borderWidth(data: number): void
  borderRadius(data: number): void
  fontSize(data: number): void
}

interface Settable {
  x: number
  y: number
  set(x?: number, y?: number): this
}

interface Resizable {
  width: number
  height: number
}

interface EntryObject {
  id: string
  getLock(): boolean
}

interface Entity {
  x: number
  y: number
  setX(data: number): void
  setY(data: number): void
  initCommand(): void
  parent: EntryObject
}

interface StageEvent {
  stageX: number
  stageY: number
}

interface StageObject {
  variable: {
    setX(data: number): void
    setY(data: number): void
    updateView(): void
  }
  x: number
  y: number
  cursor: string
  parent: {
    x: number
    y: number
  }
  offset: {
    x: number
    y: number
  }
  on(event: string, handler: (event: StageEvent) => void): void
  entity: Entity
  _listeners?: {
    [k: string]: Function[]
  }
}

interface Handle {
  // dispatchEditStartEvent(): void
  // getGlobalCoordinate(object: StageObject): {
  //   x: number
  //   y: number
  // }
  // knobs: StageObject[]
  getEventCoordinate(event: StageEvent): {
    x: number
    y: number
  }
}

const s = self, r = requestAnimationFrame
s.r = s.r || r(async function frame() {
  s.r = r(frame)

  const global = ((document.querySelector('iframe.eaizycc0') as HTMLIFrameElement | null)?.contentWindow || self) as {
    Entry?: EntryGlobal
  }
  const Entry = await new Promise<EntryGlobal | undefined>(resolve => resolve(global.Entry)).catch(() => {})
  const stage = Entry?.stage
  if (!stage) return

  const canvas = stage.canvas.canvas
  const width = Math.round(canvas.offsetWidth * devicePixelRatio), height = Math.round(width * 9 / 16)
  // if (typeof firstWidth == 'undefined') firstWidth = width
  // if (typeof firstHeight == 'undefined') firstHeight = height
  if (canvas.width != width || canvas.height != height) {
    canvas.width = width
    canvas.height = height
    stage._app.stage.x = width / 2
    stage._app.stage.y = height / 2
    stage._app.stage.scaleX = width / 480
    stage._app.stage.scaleY = height / 270

    if (stage._app.screen && stage._app.renderer) {
      stage._app.screen.width = width
      stage._app.screen.height = height
      stage._app.renderer.resize(width, height)
      stage._app.renderer.options.width = width
      stage._app.renderer.options.height = height
    }

    stage._app.render?.()
    stage._app.stage.update?.()
  }

  const inputField = stage.inputField
  if (inputField && !inputField._isHidden) {
    inputField.x(Math.round(width * 3 / 128))
    inputField.y(Math.round(height * 55 / 72))
    inputField.width(Math.max(1, width * 13 / 16))
    inputField.height(Math.max(1, height / 15))
    inputField.padding(width * 13 / 640)
    inputField.borderWidth(width / 320)
    inputField.borderRadius(width / 64)
    inputField.fontSize(width / 32)

    if (Entry.options.useWebGL) {
      const view = inputField.getPixiView()
      view.scale.set(480 / width, 270 / height)
      view.position.set((inputField._x - stage._app.stage.x) / stage._app.stage.scaleX, (inputField._y - stage._app.stage.y) / stage._app.stage.scaleY)
    }
    Entry.requestUpdate = true
    stage.update()
    Entry.requestUpdate = false
  }

  for (const { entity: { object } } of Entry.container.objects_) {
    const { _listeners } = object
    if (!_listeners || _listeners._viewportPatched) return
    _listeners.mousedown = []
    _listeners.pressmove = []
    _listeners._viewportPatched = []
    object.on('mousedown', ({ stageX, stageY }) => {
      Entry.dispatchEvent('entityClick', object.entity)
      stage.isObjectClick = true
      if (Entry.type != 'minimize' && stage.isEntitySelectable()) {
        object.offset = {
          x: -object.parent.x + object.entity.x - ((stageX - stage._app.stage.x) / stage._app.stage.scaleX),
          y: -object.parent.y - object.entity.y - ((stageY - stage._app.stage.y) / stage._app.stage.scaleY),
        }
        object.cursor = 'move'
        object.entity.initCommand()
        Entry.container.selectObject(object.entity.parent.id)
      }
    })
    object.on('pressmove', ({ stageX, stageY }) => {
      if (!stage.isEntitySelectable()) return
      const { entity } = object
      if (entity.parent.getLock()) return
      if (object.offset) {
        entity.setX((stageX - stage._app.stage.x) / stage._app.stage.scaleX + object.offset.x)
        entity.setY((stage._app.stage.y - stageY) / stage._app.stage.scaleY - object.offset.y)
      }
      stage.updateObject()
    })
  }
  stage.handle.getEventCoordinate = ({ stageX, stageY }) => ({
    x: (stageX - stage._app.stage.x) / stage._app.stage.scaleX,
    y: (stageY - stage._app.stage.y) / stage._app.stage.scaleY,
  })
  for (const variable of stage.variableContainer.children) {
    const { _listeners } = variable
    if (!_listeners || _listeners._viewportPatched) return
    _listeners.mousedown = []
    _listeners.pressmove = []
    _listeners._viewportPatched = []
    variable.on('mousedown', ({ stageX, stageY }) => Entry.type == 'workspace' && (
      variable.offset = {
        x: variable.x - (stageX - stage._app.stage.x) / stage._app.stage.scaleX,
        y: variable.y - (stageY - stage._app.stage.y) / stage._app.stage.scaleY,
      }
    ))
    variable.on('pressmove', ({ stageX, stageY }) => Entry.type == 'workspace' && (
      variable.variable.setX((stageX - stage._app.stage.x) / stage._app.stage.scaleX + variable.offset.x),
      variable.variable.setY((stageY - stage._app.stage.y) / stage._app.stage.scaleY + variable.offset.y),
      variable.variable.updateView()
    ))
  }
})

export {}
