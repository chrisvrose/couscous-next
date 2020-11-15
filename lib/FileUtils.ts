import path from 'path';

/**
 * flags
 * @param flags flags integer
 */
export async function toFlags(flags: number) {
    flags = flags & 3;
    if (flags === 0) return 'r';
    if (flags === 1) return 'w';
    return 'r+';
}

/**
 * Clean folder path, and attach to root
 * @param pathStr path
 */
export function toRoot(pathStr: string) {
    return path.join('/', path.normalize(pathStr));
}
/**
 * Split path into array of folders, cleaning the folder string requested
 * @param pathstr Path string
 */

export async function splitPath(pathstr: string) {
    const currentPath = toRoot(pathstr);
    return currentPath.split('/').filter(e => e);
}

/**
 * A file's location
 * @param pathstr
 */
export function folderPath(pathstr: string) {
    return path.dirname(toRoot(pathstr));
}

/**
 * A file's name
 * @param pathstr
 */
export function fileName(pathstr: string) {
    return path.basename(toRoot(pathstr));
}
