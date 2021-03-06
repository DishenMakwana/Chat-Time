import React, { useState } from 'react';
import { ChatState } from '../Context/ChatProvider';
import { Box } from '@chakra-ui/react';
import { SideDrawer } from '../components/miscellaneous/SideDrawer';
import { MyChats } from '../components/MyChats';
import { ChatBox } from '../components/ChatBox';

export const ChatPage = () => {
    const { user } = ChatState();
    const [fetchAgain, setFetchAgain] = useState(false);

    // console.log('chatpage render');

    return (
        <div style={{ width: '100%' }}>
            {user && <SideDrawer />}
            <Box
                d='flex'
                justifyContent={'space-between'}
                w='100%'
                h='91.5vh'
                p='10px'>
                {user && <MyChats fetchAgain={fetchAgain} />}
                {user && (
                    <ChatBox
                        fetchAgain={fetchAgain}
                        setFetchAgain={setFetchAgain}
                    />
                )}
            </Box>
        </div>
    );
};
