import ChatRoom from "../../../components/ChatRoom";
import { BACKEND_URL } from "../../../config";
import axios from "axios"


async function getRoomId(slug: string) {
    const resp = await axios.get(`${BACKEND_URL}/room/${slug}`)
    return resp.data.room.id;

}

export default async function ChatRoomPage({ params }: {
    params: {
        slug: string
    }
}) {
    const slug = (await params).slug;
    const roomId = await getRoomId(slug)
    return (
        <>
            <ChatRoom id={roomId} />
        </>
    )
}