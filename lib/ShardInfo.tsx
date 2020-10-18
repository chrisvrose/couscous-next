export interface ShardInfo {
    _id: string;
    host: string;
    state: number;
    draining?: boolean;
}
export interface GetShardsResponse {
    ok: boolean;
    shards: ShardInfo[];
}
