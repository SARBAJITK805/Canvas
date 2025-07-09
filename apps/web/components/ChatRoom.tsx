import axios from "axios";
import { BACKEND_URL } from "../config";
import { ChatRoomClient } from "./ChatRoomClient";

async function getChat(roomId:string){
    const resp=await axios.get(`${BACKEND_URL}/chats/${roomId}`)
    return resp.data.messages
}

export default async function ChatRoom({id}:{id:string}){
    const messages=await getChat(id)
    return(
        <ChatRoomClient messages={messages} id={id} />
    )
}