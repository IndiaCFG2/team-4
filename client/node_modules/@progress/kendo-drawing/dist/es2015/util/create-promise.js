export default function createPromise() {
    let resolveFn, rejectFn;
    const promise = new Promise((resolve, reject) => {
        resolveFn = (data) => {
            promise._state = "resolved";
            resolve(data);
            return promise;
        };
        rejectFn = (data) => {
            promise._state = "rejected";
            reject(data);

            return promise;
        };
    });
    promise._state = "pending";
    promise.resolve = resolveFn;
    promise.reject = rejectFn;
    promise.state = () => promise._state;

    return promise;
}
