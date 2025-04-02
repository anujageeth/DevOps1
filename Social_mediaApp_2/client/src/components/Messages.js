import {
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { AiFillCaretLeft, AiFillMessage } from "react-icons/ai";
import { Link } from "react-router-dom";
import { getMessages, sendMessage } from "../api/messages";
import { isLoggedIn } from "../helpers/authHelper";
import { socket } from "../helpers/socketHelper";
import Loading from "./Loading";
import Message from "./Message";
import SendMessage from "./SendMessage";
import UserAvatar from "./UserAvatar";
import HorizontalStack from "./util/HorizontalStack";

const Messages = ({ 
  conversations, 
  conservant, 
  getConversation, 
  setConversations, 
  setConservant, 
  mobile 
}) => {
  const messagesEndRef = useRef(null);
  const user = isLoggedIn();
  const [messages, setMessages] = useState(null);
  const [loading, setLoading] = useState(true);

  const conversationsRef = useRef(conversations);
  const conservantRef = useRef(conservant);
  const messagesRef = useRef(messages);
  useEffect(() => {
    conversationsRef.current = conversations;
    conservantRef.current = conservant;
    messagesRef.current = messages;
  });

  const conversation =
    conversations &&
    conservant &&
    getConversation(conversations, conservant._id);

  const setDirection = useCallback((messages) => {
    messages.forEach((message) => {
      if (message.sender._id === user.userId) {
        message.direction = "from";
      } else {
        message.direction = "to";
      }
    });
  }, [user.userId]);

  const fetchMessages = useCallback(async () => {
    if (conversation) {
      if (conversation.new) {
        setLoading(false);
        setMessages(conversation.messages);
        return;
      }

      setLoading(true);
      const data = await getMessages(user, conversation._id);
      setDirection(data);

      if (data && !data.error) {
        setMessages(data);
      }
      setLoading(false);
    }
  }, [conversation, user, setDirection]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages, conservant]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView();
  }, []);

  useEffect(() => {
    if (messages) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  const handleSendMessage = async (content) => {
    const newMessage = { direction: "from", content };
    const newMessages = [newMessage, ...messages];

    if (conversation.new) {
      conversation.messages = [...conversation.messages, newMessage];
    }

    let newConversations = conversations.filter(
      (conversationCompare) => conversation._id !== conversationCompare._id
    );

    newConversations.unshift(conversation);

    setConversations(newConversations);

    setMessages(newMessages);

    await sendMessage(user, newMessage, conversation.recipient._id);

    socket.emit(
      "send-message",
      conversation.recipient._id,
      user.username,
      content
    );
  };

  const handleReceiveMessage = useCallback((senderId, username, content) => {
    const newMessage = { direction: "to", content };

    const conversation = getConversation(
      conversationsRef.current,
      senderId
    );

    if (conversation) {
      let newMessages = [newMessage];
      if (messagesRef.current) {
        newMessages = [...newMessages, ...messagesRef.current];
      }

      setMessages(newMessages);

      if (conversation.new) {
        conversation.messages = newMessages;
      }
      conversation.lastMessageAt = Date.now();

      let newConversations = conversationsRef.current.filter(
        (conversationCompare) => conversation._id !== conversationCompare._id
      );

      newConversations.unshift(conversation);

      setConversations(newConversations);
    } else {
      const newConversation = {
        _id: senderId,
        recipient: { _id: senderId, username },
        new: true,
        messages: [newMessage],
        lastMessageAt: Date.now(),
      };
      setConversations([newConversation, ...conversationsRef.current]);
    }

    scrollToBottom();
  }, [getConversation, setConversations, scrollToBottom]);

  useEffect(() => {
    socket.on("receive-message", handleReceiveMessage);
    return () => {
      socket.off("receive-message", handleReceiveMessage);
    };
  }, [handleReceiveMessage]);

  return conservant ? (
    <>
      {messages && conversation && !loading ? (
        <>
          <HorizontalStack
            alignItems="center"
            spacing={2}
            sx={{ px: 2, height: "60px" }}
          >
            {mobile && (
              <IconButton
                onClick={() => setConservant(null)}
                sx={{ padding: 0 }}
              >
                <AiFillCaretLeft />
              </IconButton>
            )}
            <UserAvatar
              username={conservant.username}
              height={30}
              width={30}
            />
            <Typography>
              <Link to={"/users/" + conservant.username}>
                <b>{conservant.username}</b>
              </Link>
            </Typography>
          </HorizontalStack>
          <Divider />
          <Box sx={{ height: "calc(100vh - 240px)" }}>
            <Box sx={{ height: "100%" }}>
              <Stack
                sx={{ padding: 2, overflowY: "auto", maxHeight: "100%" }}
                direction="column-reverse"
              >
                <div ref={messagesEndRef} />
                {messages.map((message, i) => (
                  <Message
                    conservant={conservant}
                    message={message}
                    key={i}
                  />
                ))}
              </Stack>
            </Box>
          </Box>
          <SendMessage onSendMessage={handleSendMessage} />
          {scrollToBottom()}
        </>
      ) : (
        <Stack sx={{ height: "100%" }} justifyContent="center">
          <Loading />
        </Stack>
      )}
    </>
  ) : (
    <Stack
      sx={{ height: "100%" }}
      justifyContent="center"
      alignItems="center"
      spacing={2}
    >
      <AiFillMessage size={80} />
      <Typography variant="h5">PostIt Messenger</Typography>
      <Typography color="text.secondary">
        Privately message other users on PostIt
      </Typography>
    </Stack>
  );
};

export default Messages;
