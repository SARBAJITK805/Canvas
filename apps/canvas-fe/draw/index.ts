export function initDraw(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return

    let startX = 0;
    let startY = 0
    let clicked = false

    canvas.addEventListener("mousedown", (e) => {
        clicked = true
        startX = e.clientX
        startY = e.clientY
        console.log(e.clientX, e.clientY);
    })
    canvas.addEventListener("mousemove", (e) => {
        if (clicked) {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            ctx.strokeRect(startX, startY, e.clientX - startX, e.clientY - startY)
            console.log(e.clientX, e.clientY);
        }
    })
    canvas.addEventListener("mouseup", (e) => {
        clicked = false
        console.log(e.clientX, e.clientY);
    })
}