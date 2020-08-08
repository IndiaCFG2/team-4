function now() {
    return new Date().getTime();
}

export default function throttle(fn, delay) {
    let lastExecTime = 0;
    let timeout;

    if (!delay || delay <= 0) {
        return fn;
    }

    const throttled = function() {
        const elapsed = now() - lastExecTime;
        const args = arguments;

        const exec = function() {
            fn.apply(null, args);
            lastExecTime = now();
        };

        // first execution
        if (!lastExecTime) {
            return exec();
        }

        if (timeout) {
            clearTimeout(timeout);
        }

        if (elapsed > delay) {
            exec();
        } else {
            timeout = setTimeout(exec, delay - elapsed);
        }
    };

    throttled.cancel = function() {
        clearTimeout(timeout);
    };

    return throttled;
}