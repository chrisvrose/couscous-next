export interface GroupListLet {
    gid: number;
    name: string;
}

export interface GroupListResponse {
    ok: true;
    groups: GroupListLet[];
}
