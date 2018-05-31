export const sleep = (time: number): Promise<void> => {
    return new Promise<void>(resolve => {
        window.setTimeout(() => resolve(), time)
    })
}

export const waitFor = async (
    func: () => boolean,
    message: string,
    timeout: number = 1000,
): Promise<void> => {
    const tries = 10
    let currentTry = 1
    let lastValue = func()

    while (!lastValue && currentTry <= tries) {
        await sleep(timeout / tries)
        lastValue = func()
        currentTry++
    }

    if (currentTry > tries) {
        throw new Error("WaitFor failed: " + message)
    }
}
