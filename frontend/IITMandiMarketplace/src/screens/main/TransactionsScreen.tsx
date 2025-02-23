import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import transactionService, { Transaction } from '../../services/transaction';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingScreen } from '../../components/LoadingScreen/LoadingScreen';
import { formatDateTime } from '../../utils/date';
import { ProfileScreenProps } from '../../navigation/types';

type Props = ProfileScreenProps<'MyTransactions'>;

const TransactionStatusIcon = {
  PENDING: { name: 'clock-outline' as const, color: '#FFA500' },
  COMPLETED: { name: 'check-circle-outline' as const, color: '#4CAF50' },
  CANCELLED: { name: 'close-circle-outline' as const, color: '#F44336' },
};

export const TransactionsScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadTransactions = useCallback(async (pageNum = 1, refresh = false) => {
    try {
      const response = await transactionService.getTransactions(pageNum);
      if (response.status === 'success') {
        const { transactions: newTransactions, hasMore: more } = response.data;
        setTransactions(prev => 
          refresh ? newTransactions : [...prev, ...newTransactions]
        );
        setHasMore(more);
        setError(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load transactions');
    }
  }, []);

  useEffect(() => {
    loadTransactions();
    setIsLoading(false);
  }, [loadTransactions]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadTransactions(1, true);
    setIsRefreshing(false);
    setPage(1);
  }, [loadTransactions]);

  const handleLoadMore = useCallback(() => {
    if (!hasMore || isLoading || isRefreshing) return;
    setPage(prev => {
      loadTransactions(prev + 1);
      return prev + 1;
    });
  }, [hasMore, isLoading, isRefreshing, loadTransactions]);

  const handleUpdateStatus = useCallback(async (id: string, status: Transaction['status']) => {
    try {
      await transactionService.updateTransaction(id, status);
      handleRefresh();
      setSelectedTransaction(null);
    } catch (err: any) {
      setError(err.message || 'Failed to update transaction');
    }
  }, [handleRefresh]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    transactionContainer: {
      padding: 16,
      marginHorizontal: 16,
      marginVertical: 8,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    statusIcon: {
      marginRight: 8,
    },
    title: {
      flex: 1,
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.text,
    },
    amount: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    details: {
      marginTop: 8,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    label: {
      color: theme.colors.text + '99',
    },
    value: {
      color: theme.colors.text,
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 12,
      gap: 8,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
    },
    emptyText: {
      fontSize: 16,
      color: theme.colors.text + '80',
      textAlign: 'center',
      marginTop: 8,
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      padding: 16,
    },
    modalContent: {
      backgroundColor: theme.colors.background,
      borderRadius: 8,
      padding: 16,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 16,
    },
    modalCloseButton: {
      position: 'absolute',
      right: 16,
      top: 16,
    },
  });

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const isSeller = item.sellerId === user?._id;
    const status = TransactionStatusIcon[item.status];

    return (
      <TouchableOpacity onPress={() => setSelectedTransaction(item)}>
        <Card style={styles.transactionContainer}>
          <View style={styles.header}>
            <MaterialCommunityIcons
              name={status.name}
              size={24}
              color={status.color}
              style={styles.statusIcon}
            />
            <Text style={styles.title}>
              {isSeller ? 'Sold' : 'Purchased'} Item
            </Text>
            <Text style={styles.amount}>₹{item.amount}</Text>
          </View>

          <View style={styles.details}>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Status</Text>
              <Text style={styles.value}>{item.status}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Date</Text>
              <Text style={styles.value}>{formatDateTime(item.createdAt)}</Text>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderTransactionDetails = () => {
    if (!selectedTransaction) return null;

    const isSeller = selectedTransaction.sellerId === user?._id;
    const status = TransactionStatusIcon[selectedTransaction.status];

    return (
      <Modal
        visible={!!selectedTransaction}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedTransaction(null)}
      >
        <View style={styles.modalContainer}>
          <Card style={styles.modalContent}>
            <Text style={styles.modalTitle}>Transaction Details</Text>
            
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setSelectedTransaction(null)}
            >
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={theme.colors.text}
              />
            </TouchableOpacity>

            <View style={styles.header}>
              <MaterialCommunityIcons
                name={status.name}
                size={24}
                color={status.color}
                style={styles.statusIcon}
              />
              <Text style={styles.title}>
                {isSeller ? 'Sold' : 'Purchased'} Item
              </Text>
              <Text style={styles.amount}>₹{selectedTransaction.amount}</Text>
            </View>

            <View style={styles.details}>
              <View style={styles.detailRow}>
                <Text style={styles.label}>Status</Text>
                <Text style={styles.value}>{selectedTransaction.status}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.label}>Payment Method</Text>
                <Text style={styles.value}>{selectedTransaction.paymentMethod}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.label}>Date</Text>
                <Text style={styles.value}>{formatDateTime(selectedTransaction.createdAt)}</Text>
              </View>
            </View>

            {selectedTransaction.status === 'PENDING' && (
              <View style={styles.actions}>
                <Button
                  title="Cancel"
                  variant="outlined"
                  onPress={() => handleUpdateStatus(selectedTransaction.id, 'CANCELLED')}
                />
                {isSeller && (
                  <Button
                    title="Complete"
                    onPress={() => handleUpdateStatus(selectedTransaction.id, 'COMPLETED')}
                  />
                )}
              </View>
            )}
          </Card>
        </View>
      </Modal>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons
        name="script-text-outline"
        size={48}
        color={theme.colors.text + '80'}
      />
      <Text style={styles.emptyText}>
        No transactions yet
      </Text>
    </View>
  );

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={renderEmpty}
      />
      {renderTransactionDetails()}
    </View>
  );
};
