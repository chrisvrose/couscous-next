export const fetcher = async (url: string) => {
    const res = await fetch(url);
    // If the status code is not in the range 200-299,
    // we still try to parse and throw it.
    if (!res.ok) {
        const error: Error & { status?: number } = new Error('could not fetch');
        error.status = res.status;
        throw error;
    }
    return res.json();
};

// export const fetcherWithData = (data: any, method: string = 'post') => {
//     console.log('W>Registed', data);
//     return async (url: string) => {
//         console.info('I>Fetching with data', data);
//         const res = await fetch(url, {
//             method,
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify(data),
//         });

//         if (!res.ok) {
//             const error: Error & { status?: number } = new Error(
//                 'could not fetch'
//             );
//             error.status = res.status;
//             throw error;
//         }
//         return res.json();
//     };
// };

export interface ResponseError {
    status: number;
}
