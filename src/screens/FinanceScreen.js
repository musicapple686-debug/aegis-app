import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, Alert, Dimensions } from 'react-native';
import { getFinanceLogs, addFinanceLog, deleteFinanceLog, getWishlist, addWishlist, getBuyingAdvice } from '../services/apiService';
import { Ionicons } from '@expo/vector-icons';
import { PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function FinanceScreen() {
  const [tab, setTab] = useState('tracker'); // 'tracker' or 'wishlist'
  
  // Finance State
  const [logs, setLogs] = useState([]);
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState('');
  const [person, setPerson] = useState('');
  const [type, setType] = useState('expense');
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);

  // Wishlist State
  const [wishlist, setWishlist] = useState([]);
  const [item, setItem] = useState('');

  useEffect(() => {
    fetchData();
  }, [tab]);

  const fetchData = async () => {
    setLoading(true);
    if (tab === 'tracker') {
      const data = await getFinanceLogs();
      setLogs(data);
      let bal = 0;
      data.forEach(l => {
        if (['income', 'borrowed', 'repaid_to_me'].includes(l.type)) bal += l.amount;
        else if (['expense', 'lent', 'repaid_by_me'].includes(l.type)) bal -= l.amount;
      });
      setBalance(bal);
    } else {
      const data = await getWishlist();
      setWishlist(data);
    }
    setLoading(false);
  };

  const handleAddLog = async () => {
    if (!amount || !desc) return;
    setLoading(true);
    await addFinanceLog(parseFloat(amount), type, desc, category, person);
    setAmount('');
    setDesc('');
    setCategory('');
    setPerson('');
    await fetchData();
  };

  const handleDeleteLog = async (id) => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to delete this log?')) {
        setLoading(true);
        await deleteFinanceLog(id);
        await fetchData();
      }
    } else {
      Alert.alert(
        "Delete Entry",
        "Are you sure you want to delete this transaction?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: async () => {
              setLoading(true);
              await deleteFinanceLog(id);
              await fetchData();
            }
          }
        ]
      );
    }
  };

  // Prepare chart data
  const chartColors = ['#FF9500', '#34C759', '#FF2D55', '#AF52DE', '#30B0C7', '#8E8E93'];
  const expenseData = logs.filter(l => l.type === 'expense');
  const groupedExpenses = expenseData.reduce((acc, curr) => {
    const cat = curr.category || 'Uncategorized';
    acc[cat] = (acc[cat] || 0) + curr.amount;
    return acc;
  }, {});
  
  const pieData = Object.keys(groupedExpenses).map((key, index) => ({
    name: key,
    population: groupedExpenses[key],
    color: chartColors[index % chartColors.length],
    legendFontColor: '#aaaaaa',
    legendFontSize: 12
  }));

  const handleAddWishlist = async () => {
    if (!item) return;
    setLoading(true);
    await addWishlist(item);
    setItem('');
    await fetchData();
  };

  const handleGetAdvice = async (id) => {
    setLoading(true);
    try {
      const updatedItem = await getBuyingAdvice(id);
      if (Platform.OS === 'web') {
        alert("Verdict: " + updatedItem.aiVerdict);
      } else {
        Alert.alert("Consulting Complete", updatedItem.aiVerdict);
      }
      await fetchData(); // Refresh the list
    } catch (e) {
      console.error(e);
      if (Platform.OS === 'web') alert("Error consulting AI.");
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Finance & Purchases</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, tab === 'tracker' && styles.activeTab]} onPress={() => setTab('tracker')}>
          <Text style={[styles.tabText, tab === 'tracker' && styles.activeTabText]}>Tracker</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'wishlist' && styles.activeTab]} onPress={() => setTab('wishlist')}>
          <Text style={[styles.tabText, tab === 'wishlist' && styles.activeTabText]}>Buying Guide</Text>
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator size="large" color="#007AFF" style={{marginTop: 20}} />}

      {!loading && tab === 'tracker' && (
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Current Balance</Text>
            <Text style={[styles.balanceAmount, {color: balance >= 0 ? '#4cd964' : '#ff3b30'}]}>
              {balance >= 0 ? '+' : ''}{balance}
            </Text>
          </View>

          <View style={styles.inputCard}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeSelectorScroll}>
              {['expense', 'income', 'lent', 'borrowed', 'repaid_to_me', 'repaid_by_me'].map((t) => (
                <TouchableOpacity 
                  key={t}
                  style={[styles.typeBtn, type === t && styles.activeTypeBtn]} 
                  onPress={() => setType(t)}
                >
                  <Text style={[styles.typeText, type === t && styles.activeTypeText]}>{t.replace(/_/g, ' ')}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TextInput style={styles.input} placeholder="Amount" value={amount} onChangeText={setAmount} keyboardType="numeric" placeholderTextColor="#666" />
            <TextInput style={styles.input} placeholder="Description (e.g., Groceries)" value={desc} onChangeText={setDesc} placeholderTextColor="#666" />
            
            {['expense', 'income'].includes(type) && (
              <TextInput style={styles.input} placeholder="Category (e.g., Food)" value={category} onChangeText={setCategory} placeholderTextColor="#666" />
            )}
            {['lent', 'borrowed', 'repaid_to_me', 'repaid_by_me'].includes(type) && (
              <TextInput style={styles.input} placeholder="Person (e.g., John)" value={person} onChangeText={setPerson} placeholderTextColor="#666" />
            )}
            
            <TouchableOpacity style={styles.addButton} onPress={handleAddLog}>
              <Text style={styles.addButtonText}>Log Transaction</Text>
            </TouchableOpacity>
          </View>

          {pieData.length > 0 && (
            <View style={styles.chartCard}>
              <Text style={styles.sectionTitle}>Expense Breakdown</Text>
              <PieChart
                data={pieData}
                width={screenWidth - 64}
                height={200}
                chartConfig={{
                  backgroundColor: '#1e1e1e',
                  backgroundGradientFrom: '#1e1e1e',
                  backgroundGradientTo: '#1e1e1e',
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            </View>
          )}

          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          {logs.map((log, i) => (
            <View key={i} style={styles.logRow}>
              <View style={{flex: 1}}>
                <Text style={styles.logDesc}>{log.description}</Text>
                <Text style={styles.logSubText}>
                  {log.category && log.category !== 'Uncategorized' ? `[${log.category}] ` : ''}
                  {log.person ? `👤 ${log.person} ` : ''}
                  {new Date(log.date).toLocaleDateString()}
                </Text>
              </View>
              <View style={{alignItems: 'flex-end', flexDirection: 'row'}}>
                <View style={{alignItems: 'flex-end', marginRight: 16}}>
                  <Text style={[styles.logAmount, {color: ['income', 'borrowed', 'repaid_to_me'].includes(log.type) ? '#4cd964' : '#ff3b30'}]}>
                    {['income', 'borrowed', 'repaid_to_me'].includes(log.type) ? '+' : '-'}{log.amount}
                  </Text>
                  <Text style={styles.typeBadge}>{log.type.replace(/_/g, ' ')}</Text>
                </View>
                <TouchableOpacity onPress={() => handleDeleteLog(log._id)}>
                  <Ionicons name="trash-outline" size={20} color="#ff3b30" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {!loading && tab === 'wishlist' && (
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.inputCard}>
            <Text style={styles.instruction}>Add something you want to buy. Your AI will review your past mistakes, rules, and current balance before letting you.</Text>
            <TextInput style={styles.input} placeholder="Item (e.g., PS5, New Shoes)" value={item} onChangeText={setItem} placeholderTextColor="#666" />
            <TouchableOpacity style={styles.addButton} onPress={handleAddWishlist}>
              <Text style={styles.addButtonText}>Add to Wishlist</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Your Wishlist</Text>
          {wishlist.map((w, i) => (
            <View key={i} style={styles.wishlistCard}>
              <Text style={styles.wishlistTitle}>{w.item}</Text>
              
              {w.aiVerdict ? (
                <View style={styles.verdictBox}>
                  <Text style={styles.verdictText}><Text style={{fontWeight: 'bold'}}>Verdict:</Text> {w.aiVerdict}</Text>
                </View>
              ) : (
                <TouchableOpacity style={styles.adviceButton} onPress={() => handleGetAdvice(w._id)}>
                  <Ionicons name="body" size={16} color="#fff" style={{marginRight: 8}} />
                  <Text style={styles.adviceButtonText}>Consult AI</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { padding: 24, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#222' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#ffffff', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#aaaaaa' },
  tabContainer: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#333' },
  tab: { flex: 1, padding: 16, alignItems: 'center' },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#007AFF' },
  tabText: { color: '#888', fontWeight: 'bold' },
  activeTabText: { color: '#007AFF' },
  scroll: { padding: 16, paddingBottom: 100 },
  balanceCard: { backgroundColor: '#1e1e1e', padding: 24, borderRadius: 12, alignItems: 'center', marginBottom: 16 },
  balanceLabel: { color: '#aaa', fontSize: 14, marginBottom: 8 },
  balanceAmount: { fontSize: 36, fontWeight: 'bold' },
  inputCard: { backgroundColor: '#1e1e1e', padding: 16, borderRadius: 12, marginBottom: 24 },
  chartCard: { backgroundColor: '#1e1e1e', padding: 16, borderRadius: 12, marginBottom: 24, alignItems: 'center' },
  typeSelectorScroll: { flexDirection: 'row', marginBottom: 16 },
  typeBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#121212', marginRight: 10, borderWidth: 1, borderColor: '#333' },
  activeTypeBtn: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  typeText: { color: '#888', fontWeight: 'bold', textTransform: 'capitalize' },
  activeTypeText: { color: '#fff' },
  input: { backgroundColor: '#121212', color: '#fff', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 12, borderWidth: 1, borderColor: '#333' },
  addButton: { backgroundColor: '#007AFF', padding: 14, borderRadius: 8, alignItems: 'center' },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 12, marginTop: 8 },
  logRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1e1e1e', padding: 16, borderRadius: 8, marginBottom: 8 },
  logDesc: { color: '#fff', fontSize: 16, fontWeight: '500' },
  logSubText: { color: '#888', fontSize: 12, marginTop: 4 },
  logAmount: { fontSize: 18, fontWeight: 'bold' },
  typeBadge: { color: '#007AFF', fontSize: 10, textTransform: 'uppercase', marginTop: 4, fontWeight: 'bold' },
  instruction: { color: '#aaa', marginBottom: 16, lineHeight: 20 },
  wishlistCard: { backgroundColor: '#1e1e1e', padding: 16, borderRadius: 12, marginBottom: 12 },
  wishlistTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
  adviceButton: { flexDirection: 'row', backgroundColor: '#5856d6', padding: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  adviceButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  verdictBox: { backgroundColor: '#2c2c2e', padding: 12, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: '#ff9500' },
  verdictText: { color: '#ddd', fontSize: 14, lineHeight: 20 }
});
