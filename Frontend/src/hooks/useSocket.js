import { useEffect, useInsertionEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const useSocket = (groupId, onNewExpense, onSettlementUpdate, onGroupUpdate, onMemberAdded) => {
    const socketRef = useRef(null);

    useEffect(() => {
        const socket = io(import.meta.env.VITE_API_BASE || 'http://localhost:5000', {
            transports: ['websocket'],
        });
        socketRef.current = socket;

        socket.emit('joinGroup', groupId);

        socket.off('newExpense');
        socket.off('settlements_updated');
        socket.off('groupUpdated');
        socket.off('memberAdded');

        // Expense Added

        if (onNewExpense) {
            socket.on('newExpense', (expense) => {
                toast.success(`${expense.paidBy?.name || 'Someone'} added a new expense of ₹${expense.amount}`);
                onNewExpense(expense);
            });
        }

        if (onSettlementUpdate) {
            socket.on('settlements_updated', (settlement) => {
                toast.success(`${settlement.settledBy?.name || 'Someone'} settled up! 💰`);
                onSettlementUpdate(settlement);
            });
        }

        if (onGroupUpdate) {
            socket.on('groupUpdated', (updateInfo) => {
                toast.success(`Group updated: ${updateInfo.message}`);
                onGroupUpdate(updateInfo);
            });
        }
        if (onMemberAdded) {
            socket.on('memberAdded', (member) => {
                toast.success(`${member.name} was added to the group! 🎉`);
                onMemberAdded(member);
            });
        }

        return () => {
            socket.emit('leaveGroup', groupId);
            socket.disconnect();
        }
    }, [groupId]);

    return socketRef.current;
}

export default useSocket;