import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Modal,
  Image,
  StatusBar,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { AuthService, FieldService, ExpenseService } from './src/services/api';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auth form
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // Field Shift
  const [activeShift, setActiveShift] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [startCaption, setStartCaption] = useState('Surveying wheat farmers & mandi check');

  // End Shift Modal
  const [showEndModal, setShowEndModal] = useState(false);
  const [endSummary, setEndSummary] = useState('');
  const [distanceKm, setDistanceKm] = useState('');
  const [farmersCount, setFarmersCount] = useState('');

  // Expense Modal
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expCategory, setExpCategory] = useState('TRAVEL_FUEL');
  const [expAmount, setExpAmount] = useState('');
  const [expDesc, setExpDesc] = useState('');
  const [expReceipt, setExpReceipt] = useState(null);

  // Tabs
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'history', 'expenses'
  const [historyList, setHistoryList] = useState([]);
  const [expenseList, setExpenseList] = useState([]);

  useEffect(() => {
    checkLoggedInUser();
  }, []);

  const checkLoggedInUser = async () => {
    try {
      const storedUser = await AuthService.getUser();
      const token = await AuthService.getToken();
      if (storedUser && token) {
        setUser(storedUser);
        await refreshShiftStatus();
      }
    } catch (e) {
      console.log('Error restoring user:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (loginMobile = mobile, loginPass = password) => {
    if (!loginMobile || !loginPass) {
      Alert.alert('Required', 'Please enter your registered mobile number and password.');
      return;
    }
    setAuthSubmitting(true);
    try {
      const res = await AuthService.login(loginMobile, loginPass);
      setUser(res.data);
      await refreshShiftStatus();
    } catch (err) {
      Alert.alert('Login Failed', err.message || 'Invalid credentials');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out of KrisiMarg Field App?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await AuthService.clearAuth();
          setUser(null);
          setActiveShift(null);
        }
      }
    ]);
  };

  const refreshShiftStatus = async () => {
    try {
      const res = await FieldService.getActiveSession();
      if (res.hasActiveSession) {
        setActiveShift(res.data);
      } else {
        setActiveShift(null);
      }
    } catch (e) {
      console.log('Error refreshing active shift:', e);
    }
  };

  const loadHistory = async () => {
    try {
      const res = await FieldService.getMyHistory();
      if (res.success) setHistoryList(res.data);
    } catch (e) {
      console.log('Error loading history:', e);
    }
  };

  const loadExpenses = async () => {
    try {
      const res = await ExpenseService.getMyExpenses();
      if (res.success) setExpenseList(res.data);
    } catch (e) {
      console.log('Error loading expenses:', e);
    }
  };

  // Start Shift with GPS
  const handleStartWork = async () => {
    setActionLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location Permission', 'GPS Location access is required to verify your field start point.');
        setActionLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      let addressStr = `Lat: ${loc.coords.latitude.toFixed(4)}, Lng: ${loc.coords.longitude.toFixed(4)}`;

      try {
        const reverse = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude
        });
        if (reverse && reverse.length > 0) {
          const r = reverse[0];
          addressStr = `${r.district || r.city || ''}, ${r.region || r.subregion || ''} (${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)})`;
        }
      } catch (e) {
        // Fallback to coordinates
      }

      const res = await FieldService.startWork({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        accuracy: loc.coords.accuracy || 0,
        address: addressStr,
        caption: startCaption
      });

      if (res.success) {
        setActiveShift(res.data);
        Alert.alert('Duty Started!', `GPS Coordinates & Timestamp recorded:\n${addressStr}`);
      }
    } catch (err) {
      Alert.alert('Error Starting Duty', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // End Shift with GPS
  const handleEndWork = async () => {
    setActionLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      let locCoords = null;
      let addressStr = 'End location recorded';

      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        locCoords = loc.coords;
        addressStr = `Lat: ${loc.coords.latitude.toFixed(4)}, Lng: ${loc.coords.longitude.toFixed(4)}`;
      }

      const payload = {
        sessionId: activeShift?._id,
        latitude: locCoords ? locCoords.latitude : 0,
        longitude: locCoords ? locCoords.longitude : 0,
        accuracy: locCoords?.accuracy || 0,
        address: addressStr,
        caption: 'Completed day duty',
        summaryReport: endSummary || 'Routine field visits and surveys completed',
        distanceCoveredKm: Number(distanceKm) || 0,
        farmersVisitedCount: Number(farmersCount) || 0
      };

      const res = await FieldService.endWork(payload);
      if (res.success) {
        setActiveShift(null);
        setShowEndModal(false);
        setEndSummary('');
        setDistanceKm('');
        setFarmersCount('');
        Alert.alert('Shift Ended Successfully', 'Your day report and GPS check-out were submitted to HR.');
      }
    } catch (err) {
      Alert.alert('Error Ending Duty', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Pick Receipt Photo
  const pickReceipt = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission Denied', 'Camera roll access needed for receipt proof.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.6,
        base64: true
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setExpReceipt(result.assets[0].uri);
      }
    } catch (e) {
      console.log('Image picker error:', e);
    }
  };

  // Submit Expense
  const handleSubmitExpense = async () => {
    if (!expAmount || !expDesc) {
      Alert.alert('Missing Fields', 'Please enter amount and description of expense.');
      return;
    }
    setActionLoading(true);
    try {
      const res = await ExpenseService.submitExpense({
        category: expCategory,
        amount: Number(expAmount),
        description: expDesc,
        billPhotoUrl: expReceipt || '',
        fieldWorkId: activeShift?._id || null
      });

      if (res.success) {
        setShowExpenseModal(false);
        setExpAmount('');
        setExpDesc('');
        setExpReceipt(null);
        Alert.alert('Claim Submitted!', 'Your expense has been forwarded to HR for verification & reimbursement.');
        loadExpenses();
      }
    } catch (err) {
      Alert.alert('Error Submitting Claim', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#198754" />
        <Text style={{ marginTop: 12, color: '#666' }}>Loading KrisiMarg Field App...</Text>
      </View>
    );
  }

  // ==================== LOGIN SCREEN ====================
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.loginScroll}>
            {/* Logo Badge */}
            <View style={styles.logoBadge}>
              <Text style={{ fontSize: 32 }}>🌾</Text>
            </View>
            <Text style={styles.appTitle}>KrisiMarg</Text>
            <Text style={styles.appSubtitle}>Field Officer & Expense Operations</Text>

            <View style={styles.cardBox}>
              <Text style={styles.inputLabel}>MOBILE NUMBER (LOGIN ID)</Text>
              <TextInput
                style={styles.input}
                placeholder="10-digit registered mobile"
                keyboardType="phone-pad"
                value={mobile}
                onChangeText={setMobile}
              />

              <Text style={styles.inputLabel}>PASSWORD</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter account password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />

              <TouchableOpacity
                style={[styles.primaryBtn, authSubmitting && { opacity: 0.7 }]}
                onPress={() => handleLogin()}
                disabled={authSubmitting}
              >
                {authSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryBtnText}>Sign In to Field App</Text>
                )}
              </TouchableOpacity>

              {/* Demo Quick Fill for Instant Testing */}
              <TouchableOpacity
                style={styles.demoBtn}
                onPress={() => handleLogin('9876543212', 'password123')}
              >
                <Text style={styles.demoBtnText}>⚡ 1-Tap Field Officer Demo Login</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.footerNote}>KrisiMarg Technologies • Secure Field Sourcing</Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ==================== MAIN LOGGED-IN SCREEN ====================
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#146c43" />

      {/* Header */}
      <View style={styles.appHeader}>
        <View>
          <Text style={styles.headerTitle}>{user.name}</Text>
          <Text style={styles.headerSub}>{user.designation || 'Field Officer'} • {user.department || 'Operations'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutBtnText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Navigation Sub-Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'dashboard' && styles.tabItemActive]}
          onPress={() => setActiveTab('dashboard')}
        >
          <Text style={[styles.tabText, activeTab === 'dashboard' && styles.tabTextActive]}>Today Duty</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'expenses' && styles.tabItemActive]}
          onPress={() => {
            setActiveTab('expenses');
            loadExpenses();
          }}
        >
          <Text style={[styles.tabText, activeTab === 'expenses' && styles.tabTextActive]}>My Claims</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'history' && styles.tabItemActive]}
          onPress={() => {
            setActiveTab('history');
            loadHistory();
          }}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>Shift Logs</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.contentScroll}>
        {/* ================= TAB 1: DASHBOARD ================= */}
        {activeTab === 'dashboard' && (
          <View>
            {/* Status Card */}
            <View style={[styles.statusCard, activeShift ? styles.statusCardActive : styles.statusCardInactive]}>
              <View style={styles.statusHeader}>
                <Text style={styles.statusPill}>
                  {activeShift ? '● SHIFT ACTIVE (ON FIELD)' : 'OFF DUTY'}
                </Text>
                <Text style={{ color: '#666', fontSize: 11 }}>{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</Text>
              </View>

              {activeShift ? (
                <View style={{ marginTop: 10 }}>
                  <Text style={styles.shiftStartedText}>
                    Started at: {new Date(activeShift.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  <Text style={styles.shiftLocationText}>
                    📍 {activeShift.startLocation?.address || 'GPS Location Locked'}
                  </Text>
                  <Text style={styles.shiftCaptionText}>
                    "{activeShift.startCaption}"
                  </Text>

                  {/* End Shift Button */}
                  <TouchableOpacity
                    style={[styles.endShiftBtn, actionLoading && { opacity: 0.7 }]}
                    onPress={() => setShowEndModal(true)}
                    disabled={actionLoading}
                  >
                    <Text style={styles.endShiftBtnText}>End Day Shift & Submit Report</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={{ marginTop: 10 }}>
                  <Text style={styles.offDutyNotice}>
                    Press button below to capture your starting GPS coordinates and begin daily field attendance.
                  </Text>

                  <Text style={[styles.inputLabel, { marginTop: 12 }]}>TODAY AREA / INTENDED WORK</Text>
                  <TextInput
                    style={styles.captionInput}
                    placeholder="e.g. Sourcing mustard & wheat from Khalilabad mandis"
                    value={startCaption}
                    onChangeText={setStartCaption}
                  />

                  {/* Start Shift Button */}
                  <TouchableOpacity
                    style={[styles.startShiftBtn, actionLoading && { opacity: 0.7 }]}
                    onPress={handleStartWork}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.startShiftBtnText}>📍 Start Work (GPS Check-In)</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Quick Actions Card */}
            <View style={styles.actionCard}>
              <Text style={styles.sectionHeading}>Quick Operations</Text>

              <TouchableOpacity
                style={styles.actionRowBtn}
                onPress={() => setShowExpenseModal(true)}
              >
                <View style={styles.actionIconBox}>
                  <Text style={{ fontSize: 18 }}>🧾</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.actionRowTitle}>Log Work Expense</Text>
                  <Text style={styles.actionRowSub}>Claim petrol, food DA, or farmer meeting cost</Text>
                </View>
                <Text style={{ color: '#198754', fontWeight: 'bold' }}>+ Claim</Text>
              </TouchableOpacity>
            </View>

            {/* Info Notice */}
            <View style={styles.infoBanner}>
              <Text style={styles.infoBannerTitle}>💡 Field Officer Guidelines</Text>
              <Text style={styles.infoBannerText}>
                • Start work with active GPS before reaching farmer fields.
                {'\n'}• Keep petrol bills/receipts for claims exceeding ₹500.
                {'\n'}• Daily maximum claim allowance: ₹{user.dailyExpenseLimit || 2000}.
              </Text>
            </View>
          </View>
        )}

        {/* ================= TAB 2: MY EXPENSES ================= */}
        {activeTab === 'expenses' && (
          <View>
            <View style={styles.subHeaderRow}>
              <Text style={styles.sectionHeading}>My Expense Claims</Text>
              <TouchableOpacity
                style={styles.smallAddBtn}
                onPress={() => setShowExpenseModal(true)}
              >
                <Text style={styles.smallAddBtnText}>+ Log Expense</Text>
              </TouchableOpacity>
            </View>

            {expenseList.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>No expenses claimed yet.</Text>
              </View>
            ) : (
              expenseList.map((exp) => (
                <View key={exp._id} style={styles.listItemCard}>
                  <View style={styles.listCardTop}>
                    <Text style={styles.categoryBadge}>{exp.category}</Text>
                    <Text style={styles.amountText}>₹{exp.amount}</Text>
                  </View>
                  <Text style={styles.descText}>{exp.description}</Text>
                  <View style={styles.listCardBottom}>
                    <Text style={styles.dateText}>{new Date(exp.billDate).toLocaleDateString('en-IN')}</Text>
                    <Text style={[styles.statusTag, getStatusStyle(exp.status)]}>
                      {exp.status}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* ================= TAB 3: SHIFT LOGS ================= */}
        {activeTab === 'history' && (
          <View>
            <Text style={styles.sectionHeading}>Recent Field Shifts</Text>
            {historyList.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>No past shifts recorded.</Text>
              </View>
            ) : (
              historyList.map((h) => (
                <View key={h._id} style={styles.listItemCard}>
                  <View style={styles.listCardTop}>
                    <Text style={{ fontWeight: 'bold', color: '#111' }}>{h.date}</Text>
                    <Text style={[styles.statusTag, h.status === 'COMPLETED' ? styles.tagSuccess : styles.tagWarning]}>
                      {h.status}
                    </Text>
                  </View>
                  <Text style={{ color: '#444', fontSize: 12, marginTop: 4 }}>
                    Start: {new Date(h.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {h.endTime ? ` • End: ${new Date(h.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                  </Text>
                  <Text style={{ color: '#666', fontSize: 11, marginTop: 2 }}>
                    📍 {h.startLocation?.address}
                  </Text>
                  {h.summaryReport ? (
                    <Text style={{ color: '#222', fontSize: 12, marginTop: 4, fontStyle: 'italic' }}>
                      "{h.summaryReport}"
                    </Text>
                  ) : null}
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* ================= MODAL: END SHIFT ================= */}
      <Modal visible={showEndModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>End Today's Field Shift</Text>
            <Text style={styles.modalSub}>GPS check-out will be recorded automatically.</Text>

            <Text style={styles.inputLabel}>SUMMARY OF WORK DONE *</Text>
            <TextInput
              style={[styles.input, { height: 70 }]}
              multiline
              placeholder="e.g. Visited 8 wheat farmers in Khalilabad, collected 4 mandi price updates"
              value={endSummary}
              onChangeText={setEndSummary}
            />

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>KM COVERED</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 35"
                  keyboardType="numeric"
                  value={distanceKm}
                  onChangeText={setDistanceKm}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>FARMERS VISITED</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 10"
                  keyboardType="numeric"
                  value={farmersCount}
                  onChangeText={setFarmersCount}
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowEndModal(false)}
              >
                <Text style={{ color: '#666', fontWeight: 'bold' }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={handleEndWork}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Submit & End</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL: LOG EXPENSE ================= */}
      <Modal visible={showExpenseModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Submit Work Expense Claim</Text>
            <Text style={styles.modalSub}>Forwarded directly to HR for approval.</Text>

            <Text style={styles.inputLabel}>EXPENSE CATEGORY</Text>
            <View style={styles.categorySelectRow}>
              {['TRAVEL_FUEL', 'FOOD_DA', 'FARMER_MEETING', 'LODGING', 'MISCELLANEOUS'].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catChip, expCategory === cat && styles.catChipActive]}
                  onPress={() => setExpCategory(cat)}
                >
                  <Text style={[styles.catChipText, expCategory === cat && styles.catChipTextActive]}>
                    {cat.replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>AMOUNT (₹) *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 450"
              keyboardType="numeric"
              value={expAmount}
              onChangeText={setExpAmount}
            />

            <Text style={styles.inputLabel}>PURPOSE / DESCRIPTION *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Petrol for survey in Basti district"
              value={expDesc}
              onChangeText={setExpDesc}
            />

            {/* Receipt Photo */}
            <Text style={styles.inputLabel}>BILL / RECEIPT PROOF (OPTIONAL)</Text>
            <TouchableOpacity style={styles.receiptPickerBtn} onPress={pickReceipt}>
              <Text style={{ color: '#198754', fontWeight: '600' }}>
                {expReceipt ? '✓ Receipt Attached (Change)' : '📷 Attach Receipt Photo'}
              </Text>
            </TouchableOpacity>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowExpenseModal(false)}
              >
                <Text style={{ color: '#666', fontWeight: 'bold' }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={handleSubmitExpense}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Send to HR</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const getStatusStyle = (status) => {
  switch (status) {
    case 'APPROVED_BY_HR':
    case 'APPROVED_BY_ADMIN':
      return styles.tagPrimary;
    case 'PAID_REIMBURSED':
      return styles.tagSuccess;
    case 'REJECTED':
      return styles.tagDanger;
    default:
      return styles.tagWarning;
  }
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Login
  loginScroll: { padding: 24, justifyContent: 'center', minHeight: '100%' },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#e5f4e9',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 12
  },
  appTitle: { fontSize: 26, fontWeight: 'bold', color: '#198754', textAlign: 'center' },
  appSubtitle: { fontSize: 13, color: '#666', textAlign: 'center', marginBottom: 24 },
  cardBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2
  },
  inputLabel: { fontSize: 10, fontWeight: '700', color: '#666', marginBottom: 4, letterSpacing: 0.5 },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 14,
    backgroundColor: '#fbfcfd'
  },
  captionInput: {
    borderWidth: 1,
    borderColor: '#c6ebd0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    marginBottom: 14,
    backgroundColor: '#fff'
  },
  primaryBtn: {
    backgroundColor: '#198754',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 6
  },
  primaryBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  demoBtn: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#c6ebd0',
    backgroundColor: '#e5f4e9',
    alignItems: 'center'
  },
  demoBtnText: { color: '#198754', fontSize: 12, fontWeight: '700' },
  footerNote: { textAlign: 'center', color: '#999', fontSize: 11, marginTop: 24 },

  // App Header
  appHeader: {
    backgroundColor: '#198754',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  headerSub: { color: '#c6ebd0', fontSize: 11 },
  logoutBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6
  },
  logoutBtnText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },

  // Tabs
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  tabItem: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabItemActive: { borderBottomWidth: 2, borderBottomColor: '#198754' },
  tabText: { fontSize: 13, color: '#666', fontWeight: '600' },
  tabTextActive: { color: '#198754', fontWeight: 'bold' },

  contentScroll: { padding: 14 },

  // Status Card
  statusCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1
  },
  statusCardActive: {
    backgroundColor: '#eaf7ed',
    borderColor: '#c6ebd0'
  },
  statusCardInactive: {
    backgroundColor: '#fff',
    borderColor: '#e2e8f0'
  },
  statusHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusPill: { fontWeight: 'bold', fontSize: 12, color: '#198754' },
  shiftStartedText: { fontSize: 14, fontWeight: 'bold', color: '#111' },
  shiftLocationText: { fontSize: 12, color: '#444', marginTop: 4 },
  shiftCaptionText: { fontSize: 12, color: '#666', marginTop: 4, fontStyle: 'italic' },
  offDutyNotice: { fontSize: 12, color: '#666', lineHeight: 18 },

  startShiftBtn: {
    backgroundColor: '#198754',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  startShiftBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  endShiftBtn: {
    backgroundColor: '#dc3545',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 14
  },
  endShiftBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },

  // Action Card
  actionCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#eee'
  },
  sectionHeading: { fontSize: 14, fontWeight: 'bold', color: '#111', marginBottom: 10 },
  actionRowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9'
  },
  actionIconBox: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  actionRowTitle: { fontSize: 13, fontWeight: 'bold', color: '#111' },
  actionRowSub: { fontSize: 11, color: '#666' },

  // Info Banner
  infoBanner: {
    backgroundColor: '#fffbeb',
    borderColor: '#fef3c7',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12
  },
  infoBannerTitle: { fontSize: 12, fontWeight: 'bold', color: '#92400e', marginBottom: 4 },
  infoBannerText: { fontSize: 11, color: '#78350f', lineHeight: 16 },

  // Sub Header
  subHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  smallAddBtn: {
    backgroundColor: '#198754',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6
  },
  smallAddBtnText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },

  // Lists
  listItemCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee'
  },
  listCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  categoryBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 'bold',
    color: '#475569'
  },
  amountText: { fontSize: 15, fontWeight: 'bold', color: '#111' },
  descText: { fontSize: 12, color: '#333', marginTop: 6 },
  listCardBottom: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, alignItems: 'center' },
  dateText: { fontSize: 10, color: '#888' },
  statusTag: { fontSize: 10, fontWeight: 'bold', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  tagWarning: { backgroundColor: '#fef3c7', color: '#92400e' },
  tagPrimary: { backgroundColor: '#e0f2fe', color: '#0369a1' },
  tagSuccess: { backgroundColor: '#dcfce7', color: '#15803d' },
  tagDanger: { backgroundColor: '#fee2e2', color: '#b91c1c' },

  emptyBox: { padding: 30, alignItems: 'center' },
  emptyText: { color: '#999', fontSize: 13 },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  modalBox: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20
  },
  modalTitle: { fontSize: 16, fontWeight: 'bold', color: '#111' },
  modalSub: { fontSize: 12, color: '#666', marginBottom: 14 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 14 },
  modalCancelBtn: { paddingHorizontal: 16, paddingVertical: 10 },
  modalConfirmBtn: { backgroundColor: '#198754', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 8 },

  // Category Selector Chips
  categorySelectRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  catChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, backgroundColor: '#f1f5f9' },
  catChipActive: { backgroundColor: '#198754' },
  catChipText: { fontSize: 11, color: '#555', fontWeight: '600' },
  catChipTextActive: { color: '#fff', fontWeight: 'bold' },

  receiptPickerBtn: {
    borderWidth: 1,
    borderColor: '#c6ebd0',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#fbfdfc'
  }
});
