export interface ShardInfo {
    _id: string;
    host: string;
    state: number;
}
export interface GetShardsResponse {
    ok: boolean;
    shards: ShardInfo[];
}
