import React, { useState, useRef, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { getBrainGraph } from '../services/apiService';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

export default function BrainScreen() {
  const [data, setData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [filterType, setFilterType] = useState('all');
  const [showSort, setShowSort] = useState(false);
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      const loadGraph = async () => {
        setLoading(true);
        const graphData = await getBrainGraph();
        
        // Ensure data is valid for force-graph
        const formattedData = {
          nodes: graphData.nodes.map(n => ({ id: n._id, name: n.title, content: n.content, val: n.nodeType === 'chronicle' ? 5 : 2, group: n.nodeType, createdAt: n.createdAt })),
          links: graphData.links.map(l => ({ source: l.sourceNodeId, target: l.targetNodeId, name: l.explanation }))
        };
        setData(formattedData);
        setLoading(false);
      };
      loadGraph();
    }, [])
  );

  const NODE_COLORS = {
    'vent': '#FF2D55',
    'note': '#34C759',
    'chronicle': '#007AFF',
    'consult': '#AF52DE'
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>The Brain</Text>
          <Text style={styles.subtitle}>Your living neural network.</Text>
        </View>
      </View>
      
      <View style={{ zIndex: 50 }}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#888" style={{marginRight: 8}} />
            <TextInput 
              style={styles.searchInput}
              placeholder="Search memories, rules, vents..."
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity onPress={() => setShowSort(!showSort)}>
              <Ionicons name="filter" size={24} color="#888" />
            </TouchableOpacity>
          </View>
          
          {showSort && (
            <View style={styles.sortDropdown}>
              <Text style={styles.dropdownLabel}>Sort By</Text>
              <TouchableOpacity style={styles.sortOption} onPress={() => { setSortBy('date-desc'); setShowSort(false); }}>
                <Text style={[styles.sortText, sortBy === 'date-desc' && styles.sortActive]}>Date (Newest)</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sortOption} onPress={() => { setSortBy('date-asc'); setShowSort(false); }}>
                <Text style={[styles.sortText, sortBy === 'date-asc' && styles.sortActive]}>Date (Oldest)</Text>
              </TouchableOpacity>
              
              <Text style={[styles.dropdownLabel, {marginTop: 12}]}>Filter By Type</Text>
              <TouchableOpacity style={styles.sortOption} onPress={() => { setFilterType('all'); setShowSort(false); }}>
                <Text style={[styles.sortText, filterType === 'all' && styles.sortActive]}>All Types</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sortOption} onPress={() => { setFilterType('vent'); setShowSort(false); }}>
                <Text style={[styles.sortText, filterType === 'vent' && {color: NODE_COLORS['vent'], fontWeight: 'bold'}]}>Vents</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sortOption} onPress={() => { setFilterType('note'); setShowSort(false); }}>
                <Text style={[styles.sortText, filterType === 'note' && {color: NODE_COLORS['note'], fontWeight: 'bold'}]}>Notes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sortOption} onPress={() => { setFilterType('chronicle'); setShowSort(false); }}>
                <Text style={[styles.sortText, filterType === 'chronicle' && {color: NODE_COLORS['chronicle'], fontWeight: 'bold'}]}>Chronicles</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      <View style={styles.contentContainer}>
        {loading ? (
          <ActivityIndicator color="#007AFF" size="large" />
        ) : (
          <ScrollView contentContainerStyle={styles.listContainer} onPress={() => setShowSort(false)}>
            {data.nodes
              .filter(n => (n.name + n.content).toLowerCase().includes(searchQuery.toLowerCase()))
              .filter(n => filterType === 'all' || n.group === filterType)
              .sort((a, b) => {
                if (sortBy === 'date-desc') return new Date(b.createdAt) - new Date(a.createdAt);
                if (sortBy === 'date-asc') return new Date(a.createdAt) - new Date(b.createdAt);
                return 0;
              })
              .map((node) => (
              <TouchableOpacity key={node.id} style={styles.nodeCard} onPress={() => setSelectedNode(node)}>
                <View style={[styles.nodeIndicator, { backgroundColor: NODE_COLORS[node.group] || '#fff' }]} />
                <View style={{flex: 1}}>
                  <Text style={styles.nodeCardTitle}>{node.name}</Text>
                  <Text style={styles.nodeCardDesc} numberOfLines={2}>{node.content}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {selectedNode && (
        <View style={[StyleSheet.absoluteFill, styles.customModalOverlay]}>
          <View style={styles.customModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedNode.name}</Text>
              <TouchableOpacity onPress={() => setSelectedNode(null)} style={{padding: 4}}>
                <Ionicons name="close" size={28} color="#fff" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalText}>{selectedNode.content}</Text>
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 0, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#ffffff', marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#aaaaaa' },
  toggleContainer: { flexDirection: 'row', backgroundColor: '#1e1e1e', borderRadius: 20, padding: 4 },
  toggleBtn: { padding: 8, paddingHorizontal: 16, borderRadius: 16 },
  toggleActive: { backgroundColor: '#333' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e1e1e', marginHorizontal: 24, paddingHorizontal: 16, borderRadius: 12, marginBottom: 16 },
  searchInput: { flex: 1, color: '#fff', paddingVertical: 12, fontSize: 16 },
  sortDropdown: { position: 'absolute', top: 55, right: 24, backgroundColor: '#2c2c2e', borderRadius: 12, padding: 8, elevation: 10, shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.5, shadowRadius: 10, zIndex: 100, minWidth: 150 },
  dropdownLabel: { color: '#666', fontSize: 12, fontWeight: 'bold', marginLeft: 8, marginBottom: 4, textTransform: 'uppercase' },
  sortOption: { paddingVertical: 10, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#3a3a3c' },
  sortText: { color: '#aaa', fontSize: 16 },
  sortActive: { color: '#007AFF', fontWeight: 'bold' },
  contentContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', zIndex: 1 },
  listContainer: { paddingHorizontal: 24, paddingBottom: 100, width: Dimensions.get('window').width },
  nodeCard: { flexDirection: 'row', backgroundColor: '#1e1e1e', padding: 16, borderRadius: 16, marginBottom: 12, alignItems: 'center' },
  nodeIndicator: { width: 12, height: 12, borderRadius: 6, marginRight: 16 },
  nodeCardTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  nodeCardDesc: { fontSize: 14, color: '#aaa', lineHeight: 20 },
  fab: { position: 'absolute', bottom: 24, right: 24, backgroundColor: '#007AFF', width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4 },
  customModalOverlay: { backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  customModalContent: { backgroundColor: '#1e1e1e', width: '90%', maxHeight: '80%', borderRadius: 24, padding: 24, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', flex: 1, marginRight: 16 },
  modalBody: { flexShrink: 1 },
  modalText: { fontSize: 16, color: '#ddd', lineHeight: 24 }
});
