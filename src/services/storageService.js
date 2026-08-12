import AsyncStorage from '@react-native-async-storage/async-storage';

const RULES_KEY = '@aegis_rules';
const LOGS_KEY = '@aegis_logs';

export const getRules = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(RULES_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error("Error reading rules", e);
    return [];
  }
};

export const saveRule = async (rule) => {
  try {
    const rules = await getRules();
    const newRule = { id: Date.now().toString(), ...rule };
    await AsyncStorage.setItem(RULES_KEY, JSON.stringify([newRule, ...rules]));
    return newRule;
  } catch (e) {
    console.error("Error saving rule", e);
  }
};

export const clearRules = async () => {
    await AsyncStorage.removeItem(RULES_KEY);
}

export const getLogs = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(LOGS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error("Error reading logs", e);
    return [];
  }
};

export const saveLog = async (log) => {
  try {
    const logs = await getLogs();
    const newLog = { id: Date.now().toString(), text: log, timestamp: new Date().toISOString() };
    await AsyncStorage.setItem(LOGS_KEY, JSON.stringify([newLog, ...logs]));
  } catch (e) {
    console.error("Error saving log", e);
  }
};
