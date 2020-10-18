export const fetcher = async (url: string) => {
    const res = await fetch(url);
    // If the status code is not in the range 200-299,
    // we still try to parse and throw it.
    if (!res.ok) {
        const error: Error & { status?: number } = new Error('could not fetch');
        error.status = res.status;
        throw error;
    }
    return await res.json();
};
