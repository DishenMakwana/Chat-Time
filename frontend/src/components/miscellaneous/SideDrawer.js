import React, { useState } from 'react';
import {
    Tooltip,
    Menu,
    MenuButton,
    MenuList,
    Avatar,
    MenuItem,
    MenuDivider,
    Drawer,
    DrawerOverlay,
    DrawerHeader,
    DrawerContent,
    DrawerBody,
    Input,
    useToast,
    Spinner,
    Box,
    Text,
    Button,
} from '@chakra-ui/react';
import { BellIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { ChatState } from '../../Context/ChatProvider';
import { ProfileModal } from './ProfileModal';
import { useHistory } from 'react-router-dom';
import { useDisclosure } from '@chakra-ui/hooks';
import axios from 'axios';
import { ChatLoading } from '../ChatLoading';
import { UserListItem } from '../UserAvatar/UserListItem';
import { getSender } from '../../config/ChatLogics';
import NotificationBadge from 'react-notification-badge';
import { Effect } from 'react-notification-badge';

export const SideDrawer = () => {
    const [search, setSearch] = useState('');
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingChat, setLoadingChat] = useState();

    const {
        user,
        setSelectedChat,
        chats,
        setChats,
        notification,
        setNotification,
    } = ChatState();
    const history = useHistory();
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const logoutHandler = () => {
        localStorage.removeItem('userInfo');
        history.push('/');
    };

    const handleSearch = async () => {
        if (!search) {
            toast({
                title: 'Please enter something in search',
                status: 'warning',
                duration: 5000,
                isClosable: true,
                position: 'top-left',
            });
            return;
        }

        try {
            setLoading(true);
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const { data } = await axios.get(
                `/api/user?search=${search}`,
                config
            );

            setLoading(false);
            setSearchResult(data);
        } catch (err) {
            toast({
                title: 'Error Occurred!',
                description: err.response.data.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: 'bottom-left',
            });
            setLoading(false);
        }
    };

    const accessChat = async (userId) => {
        try {
            setLoadingChat(true);

            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const { data } = await axios.post(`/api/chat`, { userId }, config);

            if (!chats.find((c) => c._id === data._id)) {
                setChats([data, ...chats]);
            }
            setSelectedChat(data);
            setLoadingChat(false);
            onClose();
        } catch (err) {
            toast({
                title: 'Error Occurred!',
                description: err.response.data.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: 'bottom-left',
            });
        }
    };

    return (
        <>
            <Box
                d='flex'
                justifyContent='space-between'
                alignItems={'center'}
                bg={'white'}
                w='100%'
                p='5px 10px 5px 10px'
                borderWidth='5px'>
                <Tooltip
                    label='Search Users to chat'
                    hasArrow
                    placement='bottom-end'>
                    <Button variant='ghost' onClick={onOpen}>
                        <i className='fas fa-search'></i>
                        <Text d={{ base: 'none', md: 'flex' }} px='4'>
                            Search User
                        </Text>
                    </Button>
                </Tooltip>

                <Text fontSize='2xl' fontFamily='Work sans'>
                    Chat Time
                </Text>

                <div>
                    <Menu>
                        <MenuButton p={1}>
                            <NotificationBadge
                                count={notification.length}
                                effect={Effect.SCALE}
                            />
                            <BellIcon fontSize='2xl' m={1} />
                        </MenuButton>
                        <MenuList pl={2}>
                            {!notification.length && 'No New Messages'}
                            {notification.map((notify) => (
                                <MenuItem
                                    key={notify._id}
                                    onClick={() => {
                                        setSelectedChat(notify.chat);
                                        setNotification(
                                            notification.filter(
                                                (n) => n !== notify
                                            )
                                        );
                                    }}>
                                    {notify.chat.isGroupChat
                                        ? `New Message in ${notify.chat.chatName}`
                                        : `New Message from ${getSender(
                                              user,
                                              notify.chat.users
                                          )}`}
                                </MenuItem>
                            ))}
                        </MenuList>
                    </Menu>
                    <Menu>
                        <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                            <Avatar
                                size='sm'
                                cursor='pointer'
                                name={user.name}
                                src={user.pic}
                            />
                        </MenuButton>
                        <MenuList>
                            <ProfileModal user={user}>
                                <MenuItem>My Profile</MenuItem>
                            </ProfileModal>
                            <MenuDivider />
                            <MenuItem onClick={logoutHandler}>Logout</MenuItem>
                        </MenuList>
                    </Menu>
                </div>
            </Box>

            <Drawer placement='left' onClose={onClose} isOpen={isOpen}>
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerHeader borderBottomWidth='1px'>
                        Search Users
                    </DrawerHeader>
                    <DrawerBody>
                        <Box d='flex' pb={2}>
                            <Input
                                placeholder='search by name or email'
                                mr={2}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <Button onClick={handleSearch}>Go</Button>
                        </Box>
                        {loading ? (
                            <ChatLoading />
                        ) : (
                            searchResult.map((user) => (
                                <UserListItem
                                    key={user._id}
                                    user={user}
                                    handleFunction={() => accessChat(user._id)}
                                />
                            ))
                        )}
                        {loadingChat && <Spinner ml='auto' d='flex' />}
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </>
    );
};
