import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';

type PresetId = 'natural' | 'deep' | 'bright' | 'robot' | 'radio';
type ColorName = 'cyan' | 'coral' | 'lilac' | 'success' | 'warning';

type Preset = {
  id: PresetId;
  name: string;
  description: string;
  detail: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  tone: ColorName;
  bars: number[];
};

const SAVED_PRESET_KEY = '@voiceshift/saved-preset';

const PRESETS: Preset[] = [
  {
    id: 'natural',
    name: 'Natural',
    description: 'Clean and close',
    detail: 'No transformation',
    icon: 'account-voice',
    tone: 'cyan',
    bars: [0.42, 0.55, 0.36, 0.68, 0.52, 0.74, 0.45, 0.58],
  },
  {
    id: 'deep',
    name: 'Deep',
    description: 'Lower register',
    detail: '−4 semitones',
    icon: 'waveform',
    tone: 'lilac',
    bars: [0.72, 0.52, 0.78, 0.42, 0.67, 0.48, 0.72, 0.55],
  },
  {
    id: 'bright',
    name: 'Bright',
    description: 'Lifted presence',
    detail: '+3 semitones',
    icon: 'star-four-points',
    tone: 'warning',
    bars: [0.3, 0.52, 0.77, 0.47, 0.74, 0.56, 0.8, 0.43],
  },
  {
    id: 'robot',
    name: 'Robot',
    description: 'Hard digital edge',
    detail: 'Bitcrush + ring',
    icon: 'robot-outline',
    tone: 'coral',
    bars: [0.76, 0.76, 0.27, 0.27, 0.76, 0.76, 0.27, 0.27],
  },
  {
    id: 'radio',
    name: 'Radio',
    description: 'Tight broadcast',
    detail: 'Band-pass warmth',
    icon: 'radio',
    tone: 'success',
    bars: [0.5, 0.64, 0.48, 0.7, 0.45, 0.62, 0.4, 0.56],
  },
];

const WAVEFORM = [
  0.25, 0.45, 0.72, 0.4, 0.83, 0.56, 0.36, 0.68, 0.5, 0.9, 0.42, 0.64,
  0.76, 0.35, 0.58, 0.8, 0.46, 0.3, 0.67, 0.52, 0.88, 0.4, 0.6, 0.28,
];

function tap(style: 'light' | 'medium' = 'light') {
  void Haptics.impactAsync(
    style === 'medium'
      ? Haptics.ImpactFeedbackStyle.Medium
      : Haptics.ImpactFeedbackStyle.Light,
  );
}

function getToneColor(colors: ReturnType<typeof useColors>, tone: ColorName) {
  return colors[tone];
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  const colors = useColors();
  return (
    <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
      {children}
    </Text>
  );
}

function StatusPill({
  icon,
  children,
  color,
}: {
  icon: keyof typeof Feather.glyphMap;
  children: React.ReactNode;
  color: string;
}) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.statusPill,
        { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
      ]}
    >
      <Feather name={icon} size={12} color={color} />
      <Text style={[styles.statusPillText, { color }]}>{children}</Text>
    </View>
  );
}

function Waveform({
  active,
  preset,
}: {
  active: boolean;
  preset: Preset;
}) {
  const colors = useColors();
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    if (!active) {
      setPulse(0);
      return;
    }
    const timer = setInterval(() => setPulse((value) => (value + 1) % 8), 180);
    return () => clearInterval(timer);
  }, [active]);

  return (
    <View style={styles.waveform} accessibilityLabel="Simulated live waveform">
      {WAVEFORM.map((value, index) => {
        const nudge = active ? Math.sin((index + pulse) * 1.15) * 0.14 : 0;
        const height = Math.max(7, Math.min(44, 44 * (value + nudge)));
        return (
          <View
            key={`${value}-${index}`}
            style={[
              styles.waveBar,
              {
                height,
                backgroundColor: active
                  ? getToneColor(colors, preset.tone)
                  : colors.border,
                opacity: active ? 0.55 + (index % 3) * 0.14 : 0.7,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

function PresetCard({
  preset,
  selected,
  saved,
  onPress,
}: {
  preset: Preset;
  selected: boolean;
  saved: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  const tone = getToneColor(colors, preset.tone);
  return (
    <Pressable
      onPress={() => {
        tap();
        onPress();
      }}
      testID={`preset-${preset.id}`}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.presetCard,
        {
          backgroundColor: selected ? colors.accent : colors.surface,
          borderColor: selected ? tone : colors.border,
          opacity: pressed ? 0.82 : 1,
          transform: [{ scale: pressed ? 0.985 : 1 }],
        },
      ]}
    >
      <View style={[styles.presetIcon, { backgroundColor: `${tone}22` }]}>
        <MaterialCommunityIcons name={preset.icon} size={19} color={tone} />
      </View>
      <View style={styles.presetCopy}>
        <View style={styles.presetNameRow}>
          <Text style={[styles.presetName, { color: colors.foreground }]}>
            {preset.name}
          </Text>
          {saved ? <Feather name="bookmark" size={13} color={tone} /> : null}
        </View>
        <Text style={[styles.presetDescription, { color: colors.mutedForeground }]}>
          {preset.description}
        </Text>
      </View>
      <View style={styles.presetMeter}>
        {preset.bars.map((bar, index) => (
          <View
            key={`${preset.id}-bar-${index}`}
            style={[
              styles.miniBar,
              { height: 7 + bar * 13, backgroundColor: tone, opacity: selected ? 0.9 : 0.42 },
            ]}
          />
        ))}
      </View>
    </Pressable>
  );
}

function InfoRow({
  icon,
  title,
  detail,
  color,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  detail: string;
  color: string;
}) {
  const colors = useColors();
  return (
    <View style={styles.infoRow}>
      <View style={[styles.infoIcon, { backgroundColor: `${color}1c` }]}>
        <MaterialCommunityIcons name={icon} size={18} color={color} />
      </View>
      <View style={styles.infoCopy}>
        <Text style={[styles.infoTitle, { color: colors.foreground }]}>{title}</Text>
        <Text style={[styles.infoDetail, { color: colors.mutedForeground }]}>{detail}</Text>
      </View>
      <Feather name="check-circle" size={16} color={colors.success} />
    </View>
  );
}

function HelpSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const colors = useColors();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.border,
              paddingBottom: 22,
            },
          ]}
        >
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <View>
              <Text style={[styles.sheetEyebrow, { color: colors.cyan }]}>QUICK START</Text>
              <Text style={[styles.sheetTitle, { color: colors.foreground }]}>
                Route a call through VoiceShift
              </Text>
            </View>
            <Pressable
              onPress={() => {
                tap();
                onClose();
              }}
              accessibilityLabel="Close setup instructions"
              style={({ pressed }) => [styles.closeButton, { opacity: pressed ? 0.55 : 1 }]}
            >
              <Feather name="x" size={20} color={colors.foreground} />
            </Pressable>
          </View>
          <Text style={[styles.sheetIntro, { color: colors.mutedForeground }]}>
            VoiceShift processes your microphone for compatible VoIP apps. Android does not
            expose ordinary cellular call audio to third-party apps.
          </Text>
          {[
            ['01', 'Allow microphone access', 'When Android asks, choose “While using the app”.'],
            ['02', 'Open your softphone', 'Use a SIP or VoIP app that accepts the system microphone input.'],
            ['03', 'Start VoiceShift first', 'Choose a voice, then keep this screen visible while you connect.'],
            ['04', 'Place the VoIP call', 'Select the softphone audio route. Your transformed mic feed is now ready.'],
          ].map(([number, title, detail]) => (
            <View key={number} style={styles.stepRow}>
              <View style={[styles.stepNumber, { backgroundColor: colors.cyan }]}>
                <Text style={[styles.stepNumberText, { color: colors.primaryForeground }]}>{number}</Text>
              </View>
              <View style={styles.stepCopy}>
                <Text style={[styles.stepTitle, { color: colors.foreground }]}>{title}</Text>
                <Text style={[styles.stepDetail, { color: colors.mutedForeground }]}>{detail}</Text>
              </View>
            </View>
          ))}
          <View style={[styles.sheetNote, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Feather name="info" size={16} color={colors.warning} />
            <Text style={[styles.sheetNoteText, { color: colors.mutedForeground }]}>
              Background and screen-off behavior depends on the softphone and Android battery settings.
            </Text>
          </View>
          <Pressable
            onPress={() => {
              tap('medium');
              onClose();
            }}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.sheetDone,
              { backgroundColor: colors.cyan, opacity: pressed ? 0.78 : 1 },
            ]}
          >
            <Text style={[styles.sheetDoneText, { color: colors.primaryForeground }]}>Got it</Text>
            <Feather name="arrow-right" size={17} color={colors.primaryForeground} />
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export default function VoiceShiftWorkspace() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [selectedId, setSelectedId] = useState<PresetId>('natural');
  const [savedId, setSavedId] = useState<PresetId | null>(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [routeReady, setRouteReady] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(SAVED_PRESET_KEY)
      .then((stored) => {
        if (!mounted) return;
        if (stored && PRESETS.some((preset) => preset.id === stored)) {
          setSavedId(stored as PresetId);
          setSelectedId(stored as PresetId);
        }
        setStorageReady(true);
      })
      .catch(() => {
        if (mounted) setStorageReady(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const selectedPreset = useMemo(
    () => PRESETS.find((preset) => preset.id === selectedId) ?? PRESETS[0],
    [selectedId],
  );

  const savePreset = async () => {
    tap('medium');
    await AsyncStorage.setItem(SAVED_PRESET_KEY, selectedId);
    setSavedId(selectedId);
  };

  const toggleSession = () => {
    tap('medium');
    setSessionActive((active) => !active);
  };

  const toggleRoute = () => {
    tap();
    setRouteReady((ready) => !ready);
  };

  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: colors.background,
          paddingTop: Math.max(insets.top, webTopInset),
          paddingBottom: Math.max(insets.bottom, webBottomInset),
        },
      ]}
    >
      <StatusBar style="light" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <View style={styles.brandLockup}>
            <Image source={require('../assets/images/icon.png')} style={styles.brandIcon} />
            <View>
              <Text style={[styles.brandName, { color: colors.foreground }]}>VoiceShift</Text>
              <Text style={[styles.brandSubline, { color: colors.mutedForeground }]}>
                POCKET VOICE INSTRUMENT
              </Text>
            </View>
          </View>
          <Pressable
            onPress={() => {
              tap();
              setHelpOpen(true);
            }}
            accessibilityRole="button"
            accessibilityLabel="Open setup and help"
            testID="open-help"
            style={({ pressed }) => [
              styles.helpButton,
              { backgroundColor: colors.surfaceElevated, borderColor: colors.border, opacity: pressed ? 0.65 : 1 },
            ]}
          >
            <Feather name="help-circle" size={20} color={colors.cyan} />
          </Pressable>
        </View>

        <View style={styles.statusRow}>
          <StatusPill icon="circle" color={sessionActive ? colors.success : colors.mutedForeground}>
            {sessionActive ? 'SESSION LIVE' : 'STANDBY'}
          </StatusPill>
          <StatusPill icon="wifi" color={colors.success}>LOCAL AUDIO</StatusPill>
          <Text style={[styles.version, { color: colors.mutedForeground }]}>v1.0</Text>
        </View>

        <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.heroTopline}>
            <View>
              <SectionLabel>LIVE SESSION</SectionLabel>
              <Text style={[styles.heroTitle, { color: colors.foreground }]}>
                {sessionActive ? 'Your voice is in the mix.' : 'Shape the signal.'}
              </Text>
            </View>
            <View style={styles.sessionToggle}>
              <Text style={[styles.toggleLabel, { color: sessionActive ? colors.cyan : colors.mutedForeground }]}>
                {sessionActive ? 'ON' : 'OFF'}
              </Text>
              <Switch
                value={sessionActive}
                onValueChange={toggleSession}
                accessibilityLabel="Toggle voice session"
                testID="session-toggle"
                trackColor={{ false: colors.border, true: colors.cyan }}
                thumbColor={sessionActive ? colors.primaryForeground : colors.mutedForeground}
                ios_backgroundColor={colors.border}
              />
            </View>
          </View>
          <View style={[styles.scope, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <View style={styles.scopeMeta}>
              <Text style={[styles.scopeLabel, { color: colors.mutedForeground }]}>INPUT / OUTPUT</Text>
              <Text style={[styles.scopeLevel, { color: sessionActive ? colors.cyan : colors.mutedForeground }]}>
                {sessionActive ? '−12.4 dB' : '— —'}
              </Text>
            </View>
            <Waveform active={sessionActive} preset={selectedPreset} />
            <View style={styles.scopeBottom}>
              <View style={styles.scopeBottomItem}>
                <View style={[styles.signalDot, { backgroundColor: colors.success }]} />
                <Text style={[styles.scopeBottomText, { color: colors.mutedForeground }]}>MIC READY</Text>
              </View>
              <Text style={[styles.scopeBottomText, { color: colors.mutedForeground }]}>
                {selectedPreset.name.toUpperCase()} / 48 KHZ
              </Text>
            </View>
          </View>
          <View style={styles.metricsRow}>
            <View style={styles.metric}>
              <Text style={[styles.metricValue, { color: colors.foreground }]}>24 ms</Text>
              <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>LATENCY</Text>
            </View>
            <View style={[styles.metricDivider, { backgroundColor: colors.border }]} />
            <View style={styles.metric}>
              <Text style={[styles.metricValue, { color: colors.foreground }]}>
                {routeReady ? 'ROUTED' : 'LOCAL'}
              </Text>
              <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>CONNECTION</Text>
            </View>
            <View style={[styles.metricDivider, { backgroundColor: colors.border }]} />
            <View style={styles.metric}>
              <Text style={[styles.metricValue, { color: colors.success }]}>GOOD</Text>
              <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>SIGNAL</Text>
            </View>
          </View>
          <Pressable
            onPress={toggleSession}
            accessibilityRole="button"
            accessibilityLabel={sessionActive ? 'Stop voice session' : 'Start voice session'}
            testID="session-action"
            style={({ pressed }) => [
              styles.primaryButton,
              {
                backgroundColor: sessionActive ? colors.coral : colors.cyan,
                opacity: pressed ? 0.78 : 1,
                transform: [{ scale: pressed ? 0.985 : 1 }],
              },
            ]}
          >
            <Ionicons
              name={sessionActive ? 'stop' : 'play'}
              size={17}
              color={sessionActive ? colors.destructiveForeground : colors.primaryForeground}
            />
            <Text
              style={[
                styles.primaryButtonText,
                { color: sessionActive ? colors.destructiveForeground : colors.primaryForeground },
              ]}
            >
              {sessionActive ? 'Stop session' : 'Start session'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.sectionHeader}>
          <SectionLabel>VOICE PRESET</SectionLabel>
          <Text style={[styles.selectionHint, { color: colors.mutedForeground }]}>
            {selectedPreset.detail}
          </Text>
        </View>
        <View style={styles.presetGrid}>
          {PRESETS.map((preset) => (
            <PresetCard
              key={preset.id}
              preset={preset}
              selected={preset.id === selectedId}
              saved={preset.id === savedId}
              onPress={() => setSelectedId(preset.id)}
            />
          ))}
        </View>
        <Pressable
          onPress={savePreset}
          disabled={!storageReady}
          accessibilityRole="button"
          testID="save-preset"
          style={({ pressed }) => [
            styles.saveButton,
            {
              borderColor: savedId === selectedId ? colors.success : colors.border,
              backgroundColor: colors.surface,
              opacity: pressed ? 0.7 : storageReady ? 1 : 0.5,
            },
          ]}
        >
          <Feather
            name={savedId === selectedId ? 'check' : 'bookmark'}
            size={16}
            color={savedId === selectedId ? colors.success : colors.cyan}
          />
          <Text style={[styles.saveButtonText, { color: colors.foreground }]}>
            {savedId === selectedId ? 'Saved on this device' : 'Save this preset locally'}
          </Text>
        </Pressable>

        <View style={styles.sectionHeader}>
          <SectionLabel>CALL ROUTE</SectionLabel>
          <View style={[styles.routeBadge, { backgroundColor: routeReady ? `${colors.success}22` : colors.accent }]}>
            <Text style={[styles.routeBadgeText, { color: routeReady ? colors.success : colors.mutedForeground }]}>
              {routeReady ? 'READY' : 'NOT SET'}
            </Text>
          </View>
        </View>
        <View style={[styles.routeCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.routeTitleRow}>
            <View style={[styles.routeIcon, { backgroundColor: `${colors.coral}1c` }]}>
              <MaterialCommunityIcons name="phone-in-talk-outline" size={21} color={colors.coral} />
            </View>
            <View style={styles.routeTitleCopy}>
              <Text style={[styles.routeTitle, { color: colors.foreground }]}>Use a VoIP / SIP app</Text>
              <Text style={[styles.routeSubtitle, { color: colors.mutedForeground }]}>
                The practical Android route
              </Text>
            </View>
            <Feather name="arrow-up-right" size={17} color={colors.coral} />
          </View>
          <Text style={[styles.routeBody, { color: colors.mutedForeground }]}>
            VoiceShift can transform your microphone for a compatible softphone. It cannot modify audio from a regular cellular call on a non-rooted device.
          </Text>
          <View style={[styles.routeDivider, { backgroundColor: colors.border }]} />
          <Pressable
            onPress={toggleRoute}
            accessibilityRole="button"
            testID="route-ready"
            style={({ pressed }) => [styles.routeAction, { opacity: pressed ? 0.65 : 1 }]}
          >
            <Feather name={routeReady ? 'check-square' : 'square'} size={18} color={routeReady ? colors.success : colors.cyan} />
            <Text style={[styles.routeActionText, { color: routeReady ? colors.success : colors.cyan }]}>
              {routeReady ? 'Softphone route marked ready' : 'I have a compatible softphone'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.sectionHeader}>
          <SectionLabel>BOUNDARIES</SectionLabel>
          <Text style={[styles.selectionHint, { color: colors.mutedForeground }]}>Android reality check</Text>
        </View>
        <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <InfoRow
            icon="phone-off-outline"
            title="Regular cellular calls"
            detail="Not supported without root access"
            color={colors.coral}
          />
          <View style={[styles.infoDivider, { backgroundColor: colors.border }]} />
          <InfoRow
            icon="cellphone-off"
            title="Background or screen off"
            detail="Depends on your softphone and battery settings"
            color={colors.warning}
          />
          <View style={[styles.infoDivider, { backgroundColor: colors.border }]} />
          <InfoRow
            icon="microphone-outline"
            title="Microphone permission"
            detail="Required before any audio is routed"
            color={colors.cyan}
          />
        </View>

        <Pressable
          onPress={() => {
            tap();
            setHelpOpen(true);
          }}
          accessibilityRole="button"
          testID="setup-help"
          style={({ pressed }) => [
            styles.helpBanner,
            { backgroundColor: colors.accent, borderColor: colors.border, opacity: pressed ? 0.75 : 1 },
          ]}
        >
          <View style={[styles.helpBannerIcon, { backgroundColor: `${colors.cyan}22` }]}>
            <Feather name="book-open" size={18} color={colors.cyan} />
          </View>
          <View style={styles.helpBannerCopy}>
            <Text style={[styles.helpBannerTitle, { color: colors.foreground }]}>New to VoiceShift?</Text>
            <Text style={[styles.helpBannerDetail, { color: colors.mutedForeground }]}>
              Follow the 60-second VoIP setup
            </Text>
          </View>
          <Feather name="chevron-right" size={19} color={colors.cyan} />
        </Pressable>

        <Text style={[styles.footerNote, { color: colors.mutedForeground }]}>
          VoiceShift is an audio companion for compatible VoIP apps. No calls are recorded or sent to a server.
        </Text>
      </ScrollView>
      <HelpSheet visible={helpOpen} onClose={() => setHelpOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 30,
  },
  header: {
    minHeight: 64,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandLockup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandIcon: {
    width: 39,
    height: 39,
    borderRadius: 13,
  },
  brandName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 19,
    letterSpacing: -0.5,
  },
  brandSubline: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 8,
    letterSpacing: 1.3,
    marginTop: 2,
  },
  helpButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 17,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  statusPillText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9,
    letterSpacing: 0.6,
  },
  version: {
    marginLeft: 'auto',
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
  },
  heroCard: {
    borderWidth: 1,
    borderRadius: 25,
    padding: 16,
    marginBottom: 25,
  },
  heroTopline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  sectionLabel: {
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1.5,
    fontSize: 10,
  },
  heroTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    letterSpacing: -0.7,
    marginTop: 4,
  },
  sessionToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: -4,
  },
  toggleLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9,
    letterSpacing: 0.7,
  },
  scope: {
    height: 122,
    borderWidth: 1,
    borderRadius: 17,
    paddingHorizontal: 13,
    paddingVertical: 11,
    justifyContent: 'space-between',
  },
  scopeMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scopeLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9,
    letterSpacing: 1,
  },
  scopeLevel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    letterSpacing: 0.4,
  },
  waveform: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 3,
  },
  waveBar: {
    width: 3,
    borderRadius: 4,
  },
  scopeBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scopeBottomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  signalDot: {
    width: 5,
    height: 5,
    borderRadius: 99,
  },
  scopeBottomText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 8,
    letterSpacing: 0.8,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 15,
  },
  metric: {
    flex: 1,
    alignItems: 'center',
  },
  metricValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
  },
  metricLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 8,
    letterSpacing: 0.7,
    marginTop: 3,
  },
  metricDivider: {
    height: 26,
    width: 1,
  },
  primaryButton: {
    height: 51,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  primaryButtonText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  selectionHint: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
  },
  presetGrid: {
    gap: 8,
  },
  presetCard: {
    minHeight: 66,
    borderRadius: 17,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  presetIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetCopy: {
    flex: 1,
    marginLeft: 10,
  },
  presetNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  presetName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
  },
  presetDescription: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    marginTop: 3,
  },
  presetMeter: {
    height: 27,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 4,
  },
  miniBar: {
    width: 2,
    borderRadius: 2,
  },
  saveButton: {
    minHeight: 46,
    borderWidth: 1,
    borderRadius: 15,
    marginTop: 9,
    marginBottom: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
  },
  routeBadge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  routeBadgeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9,
    letterSpacing: 0.8,
  },
  routeCard: {
    borderRadius: 19,
    borderWidth: 1,
    padding: 14,
    marginBottom: 25,
  },
  routeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeTitleCopy: {
    flex: 1,
    marginLeft: 10,
  },
  routeTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
  },
  routeSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    marginTop: 3,
  },
  routeBody: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 14,
  },
  routeDivider: {
    height: 1,
    marginVertical: 13,
  },
  routeAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 26,
  },
  routeActionText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
  },
  infoCard: {
    borderRadius: 19,
    borderWidth: 1,
    paddingHorizontal: 13,
    marginBottom: 17,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 70,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCopy: {
    flex: 1,
    marginLeft: 10,
    marginRight: 9,
  },
  infoTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
  },
  infoDetail: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10.5,
    marginTop: 4,
  },
  infoDivider: {
    height: 1,
    marginLeft: 46,
  },
  helpBanner: {
    minHeight: 67,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 11,
    marginBottom: 16,
  },
  helpBannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpBannerCopy: {
    flex: 1,
    marginLeft: 10,
  },
  helpBannerTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
  },
  helpBannerDetail: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10.5,
    marginTop: 4,
  },
  footerNote: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    lineHeight: 15,
    textAlign: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(3, 8, 18, 0.74)',
  },
  sheet: {
    borderTopLeftRadius: 27,
    borderTopRightRadius: 27,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(143, 166, 188, 0.45)',
    alignSelf: 'center',
    marginBottom: 19,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  sheetEyebrow: {
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1.5,
    fontSize: 10,
  },
  sheetTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 21,
    letterSpacing: -0.6,
    marginTop: 5,
    maxWidth: 285,
  },
  closeButton: {
    padding: 4,
  },
  sheetIntro: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 12,
    marginBottom: 17,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  stepNumber: {
    width: 27,
    height: 27,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9,
  },
  stepCopy: {
    flex: 1,
    marginLeft: 11,
    paddingTop: 1,
  },
  stepTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
  },
  stepDetail: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10.5,
    lineHeight: 15,
    marginTop: 3,
  },
  sheetNote: {
    borderWidth: 1,
    borderRadius: 13,
    padding: 10,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    marginTop: 2,
    marginBottom: 14,
  },
  sheetNoteText: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 10.5,
    lineHeight: 15,
  },
  sheetDone: {
    height: 48,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  sheetDoneText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
  },
});