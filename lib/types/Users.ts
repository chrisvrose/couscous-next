export interface UserElement {
    uid: number;
    email: string;
    name: string;
    role: 0 | 1;
}

export interface UserPageResponse {
    ok: true;
    users: UserElement[];
}
