declare global {
  var raf: number | undefined
}

interface Resizable {
  width: number
  height: number
}

if (!window.raf) window.raf = requestAnimationFrame(function frame() {
  window.raf = requestAnimationFrame(frame)

  const global = (document.querySelector('iframe.eaizycc0') as HTMLIFrameElement | null)?.contentWindow || self
  const { Entry } = global as Window & typeof globalThis & {
    Entry?: {
      stage?: {
        canvas: {
          canvas: HTMLCanvasElement
        }
        _app: {
          render?(): void
          stage: {
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
    }
  }
  if (!Entry?.stage) return

  const canvas = Entry.stage.canvas.canvas
  const width = canvas.clientWidth, height = canvas.clientHeight
  if (canvas.width == width && canvas.height == height) return

  canvas.width = width
  canvas.height = height

  Entry.stage._app.stage.x = width / 2
  Entry.stage._app.stage.y = height / 2
  Entry.stage._app.stage.scaleX = width / 480
  Entry.stage._app.stage.scaleY = height / 270

  if (Entry.stage._app.screen && Entry.stage._app.renderer) {
    Entry.stage._app.screen.width = width
    Entry.stage._app.screen.height = height
    Entry.stage._app.renderer.resize(width, height)
    Entry.stage._app.renderer.options.width = width
    Entry.stage._app.renderer.options.height = height
  }

  Entry.stage._app.render?.()
})

export {}
