import { GetServerSideProps } from 'next';
import { Col, Container, Row } from 'react-bootstrap';
import Header from '../components/Header';

interface shard {
    _id: string;
    host: string;
    state: number;
}
interface getShardsResponse {
    ok: boolean;
    shards: shard[];
    statusCode: number;
}

function printShards(props: getShardsResponse) {
    const { ok, shards, statusCode } = props;
    if (ok) {
        if (shards.length > 0) {
            return (
                <>
                    <h2>Shards</h2>
                    <ul>
                        {shards.map((e, i) => {
                            return (
                                <li key={i}>
                                    {e.host} - {e.state >= 1 ? 'ON' : 'OFF'}
                                </li>
                            );
                        })}
                    </ul>
                </>
            );
        } else {
            return <h2>No shards</h2>;
        }
    } else {
        if (statusCode === 500) {
            return <h2>Server error</h2>;
        }
        return <h2>No permission!</h2>;
    }
}

export default function Dashboard(props: getShardsResponse) {
    return (
        <>
            <Header title="Dashboard" activeKey="dashboard" />
            <Container fluid="md">
                <Row>
                    <Col md={4}>This is a column!</Col>
                    <Col md={6}>{printShards(props)}</Col>
                </Row>
            </Container>
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async ctx => {
    try {
        const res = await fetch('http://localhost:3000/api/getShards', {
            method: 'POST',
            headers: { cookie: ctx.req.headers.cookie },
        });
        const { ok, shards } = await res.json();
        return {
            props: {
                ok: res.ok && ok,
                shards: shards ?? [],
                statusCode: res.status,
            },
        };
    } catch (e) {
        console.error('rejected:', e);
        return {
            props: {
                ok: false,
                shards: [],
                statusCode: 500,
            },
        };
    }
};
