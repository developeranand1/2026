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
  Platform,
  Linking
} from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { AuthService, FieldService, ExpenseService, RegistrationService } from './src/services/api';

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
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'register', 'registrations', 'expenses', 'history'
  const [historyList, setHistoryList] = useState([]);
  const [expenseList, setExpenseList] = useState([]);

  // Registration Mode & Form States
  const [regSubTab, setRegSubTab] = useState('farmer'); // 'farmer' | 'buyer'
  const [registerSubmitting, setRegisterSubmitting] = useState(false);

  // Farmer form fields
  const [farmerName, setFarmerName] = useState('');
  const [farmerMobile, setFarmerMobile] = useState('');
  const [farmerFather, setFarmerFather] = useState('');
  const [farmerLand, setFarmerLand] = useState('');
  const [farmerLandUnit, setFarmerLandUnit] = useState('Bigha');
  const [farmerIrrigation, setFarmerIrrigation] = useState('Irrigated');
  const [farmerVillage, setFarmerVillage] = useState('');
  const [farmerCity, setFarmerCity] = useState('');
  const [farmerDistrict, setFarmerDistrict] = useState('');
  const [farmerState, setFarmerState] = useState('Uttar Pradesh');
  const [farmerPincode, setFarmerPincode] = useState('');
  const [farmerAadhaar, setFarmerAadhaar] = useState('');
  const [farmerPassword, setFarmerPassword] = useState('');
  const [showFarmerPass, setShowFarmerPass] = useState(false);

  // Buyer form fields
  const [buyerName, setBuyerName] = useState('');
  const [buyerMobile, setBuyerMobile] = useState('');
  const [buyerCompany, setBuyerCompany] = useState('');
  const [buyerGst, setBuyerGst] = useState('');
  const [buyerStreet, setBuyerStreet] = useState('');
  const [buyerCity, setBuyerCity] = useState('');
  const [buyerDistrict, setBuyerDistrict] = useState('');
  const [buyerState, setBuyerState] = useState('Uttar Pradesh');
  const [buyerPincode, setBuyerPincode] = useState('');
  const [buyerPassword, setBuyerPassword] = useState('');
  const [showBuyerPass, setShowBuyerPass] = useState(false);

  // Geo-tagging for registration
  const [capturedGps, setCapturedGps] = useState(null);
  const [gpsFetching, setGpsFetching] = useState(false);

  // My Registrations List State
  const [registrationsList, setRegistrationsList] = useState([]);
  const [registrationsStats, setRegistrationsStats] = useState({ total: 0, farmers: 0, buyers: 0 });
  const [regRoleFilter, setRegRoleFilter] = useState('all');
  const [regSearch, setRegSearch] = useState('');
  const [regLoading, setRegLoading] = useState(false);

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

  // Load registered farmers & buyers for current field officer
  const loadMyRegistrations = async (role = regRoleFilter, search = regSearch) => {
    setRegLoading(true);
    try {
      const res = await RegistrationService.getMyRegistrations({ role, search });
      if (res.success) {
        setRegistrationsList(res.data);
        if (res.stats) setRegistrationsStats(res.stats);
      }
    } catch (e) {
      console.log('Error loading my registrations:', e);
    } finally {
      setRegLoading(false);
    }
  };

  // Capture GPS coordinates for Registration
  const handleCaptureRegistrationLocation = async () => {
    setGpsFetching(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'GPS Location access is needed to geo-tag farmer/buyer registration.');
        setGpsFetching(false);
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
          addressStr = `${r.name || r.street || ''}, ${r.district || r.city || ''}, ${r.region || ''}`.replace(/^,\s*/, '');
          if (r.district) {
            setFarmerDistrict(r.district);
            setBuyerDistrict(r.district);
          }
          if (r.city) {
            setFarmerCity(r.city);
            setBuyerCity(r.city);
          }
          if (r.region) {
            setFarmerState(r.region);
            setBuyerState(r.region);
          }
          if (r.postalCode) {
            setFarmerPincode(r.postalCode);
            setBuyerPincode(r.postalCode);
          }
        }
      } catch (e) {
        console.log('Reverse geocode error:', e);
      }
      setCapturedGps({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        address: addressStr
      });
      Alert.alert('GPS Tagged', `Location locked:\n${addressStr}`);
    } catch (e) {
      Alert.alert('GPS Error', e.message);
    } finally {
      setGpsFetching(false);
    }
  };

  // Submit Farmer Registration
  const handleRegisterFarmerSubmit = async () => {
    if (!farmerName.trim() || !farmerMobile.trim()) {
      Alert.alert('Missing Required Fields', 'Please enter Farmer Name and 10-digit Mobile Number.');
      return;
    }
    if (farmerMobile.trim().length !== 10) {
      Alert.alert('Invalid Mobile', 'Mobile number must be exactly 10 digits.');
      return;
    }
    if (farmerPassword.trim() && farmerPassword.trim().length < 6) {
      Alert.alert('Short Password', 'Custom password must be at least 6 characters (or leave blank to use mobile number).');
      return;
    }
    setRegisterSubmitting(true);
    try {
      const payload = {
        name: farmerName.trim(),
        mobile: farmerMobile.trim(),
        password: farmerPassword.trim() || farmerMobile.trim(),
        fatherName: farmerFather.trim(),
        totalLand: farmerLand.trim(),
        landUnit: farmerLandUnit,
        irrigationType: farmerIrrigation,
        village: farmerVillage.trim(),
        city: farmerCity.trim(),
        district: farmerDistrict.trim() || user?.assignedArea?.district || '',
        state: farmerState.trim() || user?.assignedArea?.state || 'Uttar Pradesh',
        pincode: farmerPincode.trim(),
        aadhaarNumber: farmerAadhaar.trim(),
        latitude: capturedGps?.latitude || null,
        longitude: capturedGps?.longitude || null,
        address: capturedGps?.address || `${farmerVillage}, ${farmerDistrict}`
      };

      const res = await RegistrationService.registerFarmer(payload);
      if (res.success) {
        Alert.alert(
          '🌾 Farmer Registered Successfully!',
          `${res.data.name} (${res.data.mobile}) has been enrolled.\nLogin ID: ${res.data.mobile}\nPassword: ${payload.password}`
        );
        // Clear fields
        setFarmerName('');
        setFarmerMobile('');
        setFarmerPassword('');
        setShowFarmerPass(false);
        setFarmerFather('');
        setFarmerLand('');
        setFarmerVillage('');
        setFarmerCity('');
        setFarmerPincode('');
        setFarmerAadhaar('');
        setCapturedGps(null);
        // Switch to list tab & refresh
        setActiveTab('registrations');
        loadMyRegistrations('farmer');
      }
    } catch (err) {
      Alert.alert('Registration Failed', err.message);
    } finally {
      setRegisterSubmitting(false);
    }
  };

  // Submit Buyer Registration
  const handleRegisterBuyerSubmit = async () => {
    if (!buyerName.trim() || !buyerMobile.trim()) {
      Alert.alert('Missing Required Fields', 'Please enter Buyer / Contact Person Name and 10-digit Mobile Number.');
      return;
    }
    if (buyerMobile.trim().length !== 10) {
      Alert.alert('Invalid Mobile', 'Mobile number must be exactly 10 digits.');
      return;
    }
    if (buyerPassword.trim() && buyerPassword.trim().length < 6) {
      Alert.alert('Short Password', 'Custom password must be at least 6 characters (or leave blank to use mobile number).');
      return;
    }
    setRegisterSubmitting(true);
    try {
      const payload = {
        name: buyerName.trim(),
        mobile: buyerMobile.trim(),
        password: buyerPassword.trim() || buyerMobile.trim(),
        companyName: buyerCompany.trim() || `${buyerName.trim()} Traders`,
        gstNumber: buyerGst.trim(),
        street: buyerStreet.trim(),
        city: buyerCity.trim(),
        district: buyerDistrict.trim() || user?.assignedArea?.district || '',
        state: buyerState.trim() || user?.assignedArea?.state || 'Uttar Pradesh',
        pincode: buyerPincode.trim(),
        latitude: capturedGps?.latitude || null,
        longitude: capturedGps?.longitude || null,
        address: capturedGps?.address || `${buyerStreet}, ${buyerDistrict}`
      };

      const res = await RegistrationService.registerBuyer(payload);
      if (res.success) {
        Alert.alert(
          '🏬 Buyer / Trader Registered Successfully!',
          `${res.data.name} - ${payload.companyName} (${res.data.mobile}) has been enrolled.\nLogin ID: ${res.data.mobile}\nPassword: ${payload.password}`
        );
        // Clear fields
        setBuyerName('');
        setBuyerMobile('');
        setBuyerPassword('');
        setShowBuyerPass(false);
        setBuyerCompany('');
        setBuyerGst('');
        setBuyerStreet('');
        setBuyerCity('');
        setBuyerPincode('');
        setCapturedGps(null);
        // Switch to list tab & refresh
        setActiveTab('registrations');
        loadMyRegistrations('buyer');
      }
    } catch (err) {
      Alert.alert('Registration Failed', err.message);
    } finally {
      setRegisterSubmitting(false);
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
          <Text style={[styles.tabText, activeTab === 'dashboard' && styles.tabTextActive]}>Duty</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'register' && styles.tabItemActive]}
          onPress={() => {
            setActiveTab('register');
            if (user?.assignedArea?.district && !farmerDistrict) {
              setFarmerDistrict(user.assignedArea.district);
              setBuyerDistrict(user.assignedArea.district);
            }
          }}
        >
          <Text style={[styles.tabText, activeTab === 'register' && styles.tabTextActive]}>+ Enroll</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'registrations' && styles.tabItemActive]}
          onPress={() => {
            setActiveTab('registrations');
            loadMyRegistrations();
          }}
        >
          <Text style={[styles.tabText, activeTab === 'registrations' && styles.tabTextActive]}>My Leads</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'expenses' && styles.tabItemActive]}
          onPress={() => {
            setActiveTab('expenses');
            loadExpenses();
          }}
        >
          <Text style={[styles.tabText, activeTab === 'expenses' && styles.tabTextActive]}>Claims</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'history' && styles.tabItemActive]}
          onPress={() => {
            setActiveTab('history');
            loadHistory();
          }}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>Logs</Text>
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

            {/* Quick Operations Card */}
            <View style={styles.actionCard}>
              <Text style={styles.sectionHeading}>Field Operations & Registration</Text>

              {/* Action 1: Register Farmer */}
              <TouchableOpacity
                style={styles.actionRowBtn}
                onPress={() => {
                  setRegSubTab('farmer');
                  setActiveTab('register');
                  if (user?.assignedArea?.district && !farmerDistrict) {
                    setFarmerDistrict(user.assignedArea.district);
                  }
                }}
              >
                <View style={[styles.actionIconBox, { backgroundColor: '#eaf7ed' }]}>
                  <Text style={{ fontSize: 20 }}>🌾</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.actionRowTitle}>Enroll New Farmer (किसान जोड़ें)</Text>
                  <Text style={styles.actionRowSub}>Register farmer land, crops, village & phone</Text>
                </View>
                <Text style={{ color: '#198754', fontWeight: 'bold' }}>+ Add</Text>
              </TouchableOpacity>

              {/* Action 2: Register Buyer */}
              <TouchableOpacity
                style={styles.actionRowBtn}
                onPress={() => {
                  setRegSubTab('buyer');
                  setActiveTab('register');
                  if (user?.assignedArea?.district && !buyerDistrict) {
                    setBuyerDistrict(user.assignedArea.district);
                  }
                }}
              >
                <View style={[styles.actionIconBox, { backgroundColor: '#e0f2fe' }]}>
                  <Text style={{ fontSize: 20 }}>🏬</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.actionRowTitle}>Enroll Buyer / Trader (खरीदार जोड़ें)</Text>
                  <Text style={styles.actionRowSub}>Onboard mandi traders, millers & buyers</Text>
                </View>
                <Text style={{ color: '#0369a1', fontWeight: 'bold' }}>+ Add</Text>
              </TouchableOpacity>

              {/* Action 3: View My Leads */}
              <TouchableOpacity
                style={styles.actionRowBtn}
                onPress={() => {
                  setActiveTab('registrations');
                  loadMyRegistrations();
                }}
              >
                <View style={[styles.actionIconBox, { backgroundColor: '#fef3c7' }]}>
                  <Text style={{ fontSize: 20 }}>📋</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.actionRowTitle}>My Registered Farmers & Buyers</Text>
                  <Text style={styles.actionRowSub}>View and call your enrolled field contacts</Text>
                </View>
                <Text style={{ color: '#92400e', fontWeight: 'bold' }}>View →</Text>
              </TouchableOpacity>

              {/* Action 4: Log Expense */}
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
                {'\n'}• Verify farmer Aadhaar & land details during village visits.
                {'\n'}• Keep petrol bills/receipts for claims exceeding ₹500.
                {'\n'}• Daily maximum claim allowance: ₹{user.dailyExpenseLimit || 2000}.
              </Text>
            </View>
          </View>
        )}

        {/* ================= TAB 2: REGISTER FARMER / BUYER ================= */}
        {activeTab === 'register' && (
          <View>
            {/* Toggle Segment: Farmer vs Buyer */}
            <View style={styles.regToggleRow}>
              <TouchableOpacity
                style={[styles.regToggleBtn, regSubTab === 'farmer' && styles.regToggleBtnActive]}
                onPress={() => setRegSubTab('farmer')}
              >
                <Text style={[styles.regToggleText, regSubTab === 'farmer' && styles.regToggleTextActive]}>
                  🌾 Farmer Registration
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.regToggleBtn, regSubTab === 'buyer' && styles.regToggleBtnActive]}
                onPress={() => setRegSubTab('buyer')}
              >
                <Text style={[styles.regToggleText, regSubTab === 'buyer' && styles.regToggleTextActive]}>
                  🏬 Buyer / Trader
                </Text>
              </TouchableOpacity>
            </View>

            {/* GPS Tagging Header Card */}
            <View style={[styles.gpsTagBtn, capturedGps ? styles.gpsTagBtnLocked : null]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.gpsTagText}>
                  {capturedGps ? '📍 GPS Location Tagged' : '📍 Auto-Tag Current GPS Location'}
                </Text>
                <Text style={styles.gpsTagSub} numberOfLines={1}>
                  {capturedGps ? capturedGps.address : 'Click button to attach current latitude/longitude proof'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.gpsTagActionBtn}
                onPress={handleCaptureRegistrationLocation}
                disabled={gpsFetching}
              >
                {gpsFetching ? (
                  <ActivityIndicator size="small" color="#198754" />
                ) : (
                  <Text style={styles.gpsTagActionBtnText}>
                    {capturedGps ? 'Retag' : 'Tag GPS'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* FORM 1: FARMER REGISTRATION */}
            {regSubTab === 'farmer' && (
              <View style={styles.formCard}>
                <Text style={styles.formSectionTitle}>🌾 Farmer Details (किसान विवरण)</Text>
                <Text style={styles.formSectionSub}>Registered farmer will be auto-verified and linked to your office ID.</Text>

                <Text style={styles.inputLabel}>FARMER FULL NAME *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Ram Lakhan Verma"
                  value={farmerName}
                  onChangeText={setFarmerName}
                />

                <Text style={styles.inputLabel}>MOBILE NUMBER (LOGIN ID) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="10-digit mobile number"
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={farmerMobile}
                  onChangeText={setFarmerMobile}
                />

                <Text style={styles.inputLabel}>APP LOGIN PASSWORD (कस्टम पासवर्ड)</Text>
                <View style={styles.passInputWrapper}>
                  <TextInput
                    style={styles.passInput}
                    placeholder="Default: Mobile Number (or set custom)"
                    secureTextEntry={!showFarmerPass}
                    value={farmerPassword}
                    onChangeText={setFarmerPassword}
                  />
                  <TouchableOpacity
                    style={styles.passToggleBtn}
                    onPress={() => setShowFarmerPass(!showFarmerPass)}
                  >
                    <Text style={{ fontSize: 16 }}>{showFarmerPass ? '🙈' : '👁️'}</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.passNote}>
                  {farmerPassword
                    ? `🔑 Custom Password: "${farmerPassword}"`
                    : '💡 Khali chhodne par farmer ka mobile number hi password banega.'}
                </Text>

                <Text style={styles.inputLabel}>FATHER'S NAME (पिता का नाम)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Late Shri Sukhdev Verma"
                  value={farmerFather}
                  onChangeText={setFarmerFather}
                />

                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>TOTAL LAND HOLDING</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. 5"
                      keyboardType="numeric"
                      value={farmerLand}
                      onChangeText={setFarmerLand}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>UNIT</Text>
                    <View style={styles.unitRow}>
                      {['Bigha', 'Acre', 'Hectare'].map((unit) => (
                        <TouchableOpacity
                          key={unit}
                          style={[styles.unitChip, farmerLandUnit === unit && styles.unitChipActive]}
                          onPress={() => setFarmerLandUnit(unit)}
                        >
                          <Text style={[styles.unitChipText, farmerLandUnit === unit && styles.unitChipTextActive]}>
                            {unit}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>

                <Text style={styles.inputLabel}>IRRIGATION TYPE (सिंचाई प्रकार)</Text>
                <View style={styles.unitRow}>
                  {['Irrigated', 'Rainfed / Barani', 'Semi-irrigated'].map((irr) => (
                    <TouchableOpacity
                      key={irr}
                      style={[styles.unitChip, farmerIrrigation === irr && styles.unitChipActive]}
                      onPress={() => setFarmerIrrigation(irr)}
                    >
                      <Text style={[styles.unitChipText, farmerIrrigation === irr && styles.unitChipTextActive]}>
                        {irr}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={[styles.inputLabel, { marginTop: 10 }]}>VILLAGE / GRAM PANCHAYAT *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Bankata, Rampur"
                  value={farmerVillage}
                  onChangeText={setFarmerVillage}
                />

                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>TEHSIL / CITY</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. Khalilabad"
                      value={farmerCity}
                      onChangeText={setFarmerCity}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>DISTRICT *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. Sant Kabir Nagar"
                      value={farmerDistrict}
                      onChangeText={setFarmerDistrict}
                    />
                  </View>
                </View>

                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>STATE</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. Uttar Pradesh"
                      value={farmerState}
                      onChangeText={setFarmerState}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>PINCODE</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. 272175"
                      keyboardType="numeric"
                      maxLength={6}
                      value={farmerPincode}
                      onChangeText={setFarmerPincode}
                    />
                  </View>
                </View>

                <Text style={styles.inputLabel}>AADHAAR NUMBER (OPTIONAL)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="12-digit Aadhaar number"
                  keyboardType="numeric"
                  maxLength={12}
                  value={farmerAadhaar}
                  onChangeText={setFarmerAadhaar}
                />

                <TouchableOpacity
                  style={[styles.submitRegBtn, registerSubmitting && { opacity: 0.7 }]}
                  onPress={handleRegisterFarmerSubmit}
                  disabled={registerSubmitting}
                >
                  {registerSubmitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitRegBtnText}>🌾 Complete Farmer Enrollment</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* FORM 2: BUYER / TRADER REGISTRATION */}
            {regSubTab === 'buyer' && (
              <View style={styles.formCard}>
                <Text style={styles.formSectionTitle}>🏬 Buyer & Trader Details (खरीदार विवरण)</Text>
                <Text style={styles.formSectionSub}>Onboard mandi arhatiyas, millers, and corporate grain procurement traders.</Text>

                <Text style={styles.inputLabel}>CONTACT PERSON / OWNER NAME *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Suresh Kumar Agarwal"
                  value={buyerName}
                  onChangeText={setBuyerName}
                />

                <Text style={styles.inputLabel}>MOBILE NUMBER (LOGIN ID) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="10-digit mobile number"
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={buyerMobile}
                  onChangeText={setBuyerMobile}
                />

                <Text style={styles.inputLabel}>APP LOGIN PASSWORD (कस्टम पासवर्ड)</Text>
                <View style={styles.passInputWrapper}>
                  <TextInput
                    style={styles.passInput}
                    placeholder="Default: Mobile Number (or set custom)"
                    secureTextEntry={!showBuyerPass}
                    value={buyerPassword}
                    onChangeText={setBuyerPassword}
                  />
                  <TouchableOpacity
                    style={styles.passToggleBtn}
                    onPress={() => setShowBuyerPass(!showBuyerPass)}
                  >
                    <Text style={{ fontSize: 16 }}>{showBuyerPass ? '🙈' : '👁️'}</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.passNote}>
                  {buyerPassword
                    ? `🔑 Custom Password: "${buyerPassword}"`
                    : '💡 Khali chhodne par buyer ka mobile number hi password banega.'}
                </Text>

                <Text style={styles.inputLabel}>TRADING FIRM / COMPANY NAME *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Agarwal Agro Commodities Ltd"
                  value={buyerCompany}
                  onChangeText={setBuyerCompany}
                />

                <Text style={styles.inputLabel}>GST NUMBER (OPTIONAL)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 09ABCDE1234F1Z5"
                  autoCapitalize="characters"
                  value={buyerGst}
                  onChangeText={setBuyerGst}
                />

                <Text style={styles.inputLabel}>MANDI SHOP / STREET ADDRESS *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Shop No. 14, Anaj Mandi Road"
                  value={buyerStreet}
                  onChangeText={setBuyerStreet}
                />

                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>MANDI / CITY</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. Gorakhpur Mandi"
                      value={buyerCity}
                      onChangeText={setBuyerCity}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>DISTRICT *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. Gorakhpur"
                      value={buyerDistrict}
                      onChangeText={setBuyerDistrict}
                    />
                  </View>
                </View>

                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>STATE</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. Uttar Pradesh"
                      value={buyerState}
                      onChangeText={setBuyerState}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>PINCODE</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. 273001"
                      keyboardType="numeric"
                      maxLength={6}
                      value={buyerPincode}
                      onChangeText={setBuyerPincode}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.submitRegBtn, { backgroundColor: '#0369a1' }, registerSubmitting && { opacity: 0.7 }]}
                  onPress={handleRegisterBuyerSubmit}
                  disabled={registerSubmitting}
                >
                  {registerSubmitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitRegBtnText}>🏬 Complete Buyer Enrollment</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* ================= TAB 3: MY LEADS / REGISTRATIONS ================= */}
        {activeTab === 'registrations' && (
          <View>
            {/* Metric Banner */}
            <View style={styles.leadsMetricCard}>
              <View style={styles.leadsMetricItem}>
                <Text style={styles.leadsMetricNum}>{registrationsStats.total || 0}</Text>
                <Text style={styles.leadsMetricLabel}>Total Leads</Text>
              </View>
              <View style={styles.leadsMetricDivider} />
              <View style={styles.leadsMetricItem}>
                <Text style={[styles.leadsMetricNum, { color: '#198754' }]}>{registrationsStats.farmers || 0}</Text>
                <Text style={styles.leadsMetricLabel}>🌾 Farmers</Text>
              </View>
              <View style={styles.leadsMetricDivider} />
              <View style={styles.leadsMetricItem}>
                <Text style={[styles.leadsMetricNum, { color: '#0369a1' }]}>{registrationsStats.buyers || 0}</Text>
                <Text style={styles.leadsMetricLabel}>🏬 Buyers</Text>
              </View>
            </View>

            {/* Search Box with Clear Button */}
            <View style={styles.searchBox}>
              <View style={styles.searchBarContainer}>
                <Text style={{ fontSize: 16, marginRight: 6 }}>🔍</Text>
                <TextInput
                  style={styles.searchInputField}
                  placeholder="Search by name, mobile, village, city, firm..."
                  value={regSearch}
                  onChangeText={(text) => {
                    setRegSearch(text);
                    loadMyRegistrations(regRoleFilter, text);
                  }}
                />
                {regSearch ? (
                  <TouchableOpacity
                    style={styles.searchClearBtn}
                    onPress={() => {
                      setRegSearch('');
                      loadMyRegistrations(regRoleFilter, '');
                    }}
                  >
                    <Text style={{ fontSize: 13, color: '#888', fontWeight: 'bold' }}>✕</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>

            {/* Filter Pills */}
            <View style={styles.filterPillsRow}>
              {[
                { label: 'All Leads', value: 'all' },
                { label: '🌾 Farmers', value: 'farmer' },
                { label: '🏬 Buyers', value: 'buyer' }
              ].map((pill) => (
                <TouchableOpacity
                  key={pill.value}
                  style={[styles.filterPill, regRoleFilter === pill.value && styles.filterPillActive]}
                  onPress={() => {
                    setRegRoleFilter(pill.value);
                    loadMyRegistrations(pill.value, regSearch);
                  }}
                >
                  <Text style={[styles.filterPillText, regRoleFilter === pill.value && styles.filterPillTextActive]}>
                    {pill.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* List */}
            {regLoading ? (
              <View style={styles.emptyBox}>
                <ActivityIndicator size="small" color="#198754" />
                <Text style={{ marginTop: 8, color: '#666', fontSize: 12 }}>Loading registered leads...</Text>
              </View>
            ) : registrationsList.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={{ fontSize: 32, marginBottom: 8 }}>📋</Text>
                <Text style={styles.emptyText}>No registered farmers or buyers found.</Text>
                <TouchableOpacity
                  style={[styles.smallAddBtn, { marginTop: 12 }]}
                  onPress={() => setActiveTab('register')}
                >
                  <Text style={styles.smallAddBtnText}>+ Enroll First Lead Now</Text>
                </TouchableOpacity>
              </View>
            ) : (
              registrationsList.map((item) => (
                <View key={item._id} style={styles.leadCard}>
                  <View style={styles.leadCardTop}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={[styles.roleBadge, item.role === 'farmer' ? styles.roleBadgeFarmer : styles.roleBadgeBuyer]}>
                        {item.role === 'farmer' ? '🌾 Farmer' : '🏬 Buyer / Trader'}
                      </Text>
                      <Text style={styles.fieldVerifiedTag}>✓ Field Verified</Text>
                    </View>
                    <Text style={styles.leadDateText}>
                      {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </Text>
                  </View>

                  <View style={{ marginTop: 8 }}>
                    <Text style={styles.leadName}>{item.name}</Text>
                    {item.role === 'buyer' && item.buyerProfile?.companyName ? (
                      <Text style={styles.leadCompanyText}>🏢 {item.buyerProfile.companyName}</Text>
                    ) : null}
                    {item.role === 'farmer' && item.farmerProfile?.fatherName ? (
                      <Text style={styles.leadFatherText}>s/o {item.farmerProfile.fatherName}</Text>
                    ) : null}
                  </View>

                  {/* Location Info */}
                  <Text style={styles.leadLocText}>
                    📍 {item.role === 'farmer'
                      ? `${item.farmerProfile?.location?.village || ''}, ${item.farmerProfile?.location?.district || ''}, ${item.farmerProfile?.location?.state || ''}`.replace(/^,\s*/, '')
                      : `${item.buyerProfile?.address?.street || ''}, ${item.buyerProfile?.address?.district || ''}, ${item.buyerProfile?.address?.state || ''}`.replace(/^,\s*/, '')
                    }
                  </Text>

                  {/* Additional details */}
                  {item.role === 'farmer' && item.farmerProfile?.totalLand ? (
                    <Text style={styles.leadMetaText}>
                      🌱 Land: {item.farmerProfile.totalLand} {item.farmerProfile.landUnit || 'Bigha'} • {item.farmerProfile.irrigationType || 'Irrigated'}
                    </Text>
                  ) : null}

                  {item.role === 'buyer' && item.buyerProfile?.gstNumber ? (
                    <Text style={styles.leadMetaText}>
                      📜 GST: {item.buyerProfile.gstNumber}
                    </Text>
                  ) : null}

                  {/* Credentials Reminder Box */}
                  <View style={styles.credRow}>
                    <Text style={styles.credText}>
                      🔑 <Text style={{ fontWeight: 'bold' }}>Login ID:</Text> {item.mobile}  •  <Text style={{ fontWeight: 'bold' }}>Pass:</Text> Mobile / Custom
                    </Text>
                  </View>

                  {/* Action Row: Call & WhatsApp */}
                  <View style={styles.leadBottomRow}>
                    <Text style={styles.leadPhoneText}>📱 {item.mobile}</Text>
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      <TouchableOpacity
                        style={styles.whatsappBtn}
                        onPress={() => {
                          const msg = `Namaste ${item.name}, aapka KrisiMarg account ban gaya hai. Mobile: ${item.mobile}`;
                          Linking.openURL(`https://wa.me/91${item.mobile}?text=${encodeURIComponent(msg)}`);
                        }}
                      >
                        <Text style={styles.whatsappBtnText}>💬 WhatsApp</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.callBtn}
                        onPress={() => Linking.openURL(`tel:${item.mobile}`)}
                      >
                        <Text style={styles.callBtnText}>📞 Call</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))
            )}
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
  },

  // Registration Segment & Form Styles
  regToggleRow: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    borderRadius: 10,
    padding: 3,
    marginBottom: 12
  },
  regToggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8
  },
  regToggleBtnActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2
  },
  regToggleText: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  regToggleTextActive: { color: '#0f172a', fontWeight: 'bold' },

  gpsTagBtn: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  gpsTagBtnLocked: {
    backgroundColor: '#f0fdf4',
    borderColor: '#86efac'
  },
  gpsTagText: { fontSize: 12, fontWeight: 'bold', color: '#166534' },
  gpsTagSub: { fontSize: 11, color: '#64748b', marginTop: 2 },
  gpsTagActionBtn: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6
  },
  gpsTagActionBtnText: { fontSize: 11, fontWeight: 'bold', color: '#1e293b' },

  formCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16
  },
  formSectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#0f172a', marginBottom: 2 },
  formSectionSub: { fontSize: 11, color: '#64748b', marginBottom: 14 },

  unitRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  unitChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, backgroundColor: '#f1f5f9' },
  unitChipActive: { backgroundColor: '#198754' },
  unitChipText: { fontSize: 11, color: '#475569', fontWeight: '600' },
  unitChipTextActive: { color: '#fff', fontWeight: 'bold' },

  submitRegBtn: {
    backgroundColor: '#198754',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10
  },
  submitRegBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },

  // Leads & Directory Styles
  leadsMetricCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12
  },
  leadsMetricItem: { alignItems: 'center' },
  leadsMetricNum: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
  leadsMetricLabel: { fontSize: 11, color: '#64748b', marginTop: 2 },
  leadsMetricDivider: { width: 1, height: 28, backgroundColor: '#e2e8f0' },

  searchBox: { marginBottom: 10 },
  searchInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13
  },

  filterPillsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f1f5f9'
  },
  filterPillActive: { backgroundColor: '#198754' },
  filterPillText: { fontSize: 11, color: '#475569', fontWeight: '600' },
  filterPillTextActive: { color: '#fff', fontWeight: 'bold' },

  leadCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  leadCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  roleBadge: { fontSize: 10, fontWeight: 'bold', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  roleBadgeFarmer: { backgroundColor: '#dcfce7', color: '#15803d' },
  roleBadgeBuyer: { backgroundColor: '#e0f2fe', color: '#0369a1' },
  fieldVerifiedTag: { fontSize: 10, color: '#16a34a', fontWeight: '700' },
  leadDateText: { fontSize: 10, color: '#94a3b8' },

  leadName: { fontSize: 15, fontWeight: 'bold', color: '#0f172a' },
  leadCompanyText: { fontSize: 12, color: '#0369a1', fontWeight: '600', marginTop: 2 },
  leadFatherText: { fontSize: 12, color: '#64748b', marginTop: 2 },
  leadLocText: { fontSize: 12, color: '#475569', marginTop: 6 },
  leadMetaText: { fontSize: 11, color: '#64748b', marginTop: 4 },

  leadBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9'
  },
  leadPhoneText: { fontSize: 13, fontWeight: 'bold', color: '#0f172a' },
  callBtn: {
    backgroundColor: '#198754',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6
  },
  callBtnText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },

  // Password Input Styles
  passInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    backgroundColor: '#fbfcfd',
    marginBottom: 4
  },
  passInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a'
  },
  passToggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  passNote: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 14,
    fontStyle: 'italic'
  },

  // Enhanced Search Bar
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  searchInputField: {
    flex: 1,
    fontSize: 13,
    color: '#0f172a',
    paddingVertical: 6
  },
  searchClearBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4
  },

  // Credentials Box & Buttons
  credRow: {
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  credText: { fontSize: 11, color: '#334155' },
  whatsappBtn: {
    backgroundColor: '#25D366',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6
  },
  whatsappBtnText: { color: '#fff', fontSize: 11, fontWeight: 'bold' }
});
