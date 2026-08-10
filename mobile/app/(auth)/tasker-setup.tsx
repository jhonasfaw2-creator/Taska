import { useCallback, useMemo, useState } from 'react';
import { View, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { Button, Typography } from '@/components/ui';

type IdType = 'passport' | 'drivers_license' | 'national_id' | '';

interface VerificationState {
  fullName: string;
  dateOfBirth: string;
  idDocument: string;
  idType: IdType;
  phoneNumber: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  profilePhoto: string;
}

type SectionKey = 'personal' | 'identity' | 'contact' | 'photo';

const ID_TYPE_OPTIONS: { value: IdType; label: string }[] = [
  { value: 'passport', label: 'Passport' },
  { value: 'drivers_license', label: "Driver's License" },
  { value: 'national_id', label: 'National ID' },
];

interface SectionConfig {
  key: SectionKey;
  icon: string;
  title: string;
}

const SECTIONS: SectionConfig[] = [
  { key: 'personal', icon: '👤', title: 'Personal Information' },
  { key: 'identity', icon: '🆔', title: 'Identity Verification' },
  { key: 'contact', icon: '📞', title: 'Contact Information' },
  { key: 'photo', icon: '📷', title: 'Profile Photo' },
];

const EMPTY_STATE: VerificationState = {
  fullName: '',
  dateOfBirth: '',
  idDocument: '',
  idType: '',
  phoneNumber: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  profilePhoto: '',
};

export default function TaskerSetupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [form, setForm] = useState<VerificationState>(EMPTY_STATE);
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [expandedSection, setExpandedSection] = useState<SectionKey | null>(
    'personal'
  );

  const updateField = useCallback(
    <K extends keyof VerificationState>(field: K, value: VerificationState[K]) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const markTouched = useCallback((field: string) => {
    setTouched((prev) => new Set(prev).add(field));
  }, []);

  const markAllTouched = useCallback(() => {
    const allFields = [
      'fullName',
      'dateOfBirth',
      'idDocument',
      'idType',
      'phoneNumber',
      'profilePhoto',
    ];
    setTouched(new Set(allFields));
  }, []);

  const sectionStatus = useMemo(() => {
    const personalComplete =
      form.fullName.trim().length > 0 && form.dateOfBirth.trim().length > 0;

    const identityComplete =
      form.idDocument.trim().length > 0 && form.idType !== '';

    const contactComplete = form.phoneNumber.trim().length > 0;

    const photoComplete = form.profilePhoto.trim().length > 0;

    return {
      personal: personalComplete,
      identity: identityComplete,
      contact: contactComplete,
      photo: photoComplete,
    };
  }, [form]);

  const isContinueEnabled = useMemo(
    () =>
      sectionStatus.personal &&
      sectionStatus.identity &&
      sectionStatus.contact &&
      sectionStatus.photo,
    [sectionStatus]
  );

  const toggleSection = useCallback((key: SectionKey) => {
    setExpandedSection((prev) => (prev === key ? null : key));
  }, []);

  const handleContinue = useCallback(() => {
    markAllTouched();
    if (!isContinueEnabled) return;
    router.push('/vehicle-registration');
  }, [isContinueEnabled, markAllTouched, router]);

  const renderInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    fieldKey: string,
    options?: {
      placeholder?: string;
      keyboardType?: 'default' | 'phone-pad';
      autoComplete?: 'name' | 'birthdate-full' | 'tel' | 'name-family' | 'tel-device';
      textContentType?: 'name' | 'birthdate' | 'telephoneNumber' | 'fullStreetAddress';
    }
  ) => {
    const isFieldTouched = touched.has(fieldKey);
    const showError = isFieldTouched && value.trim().length === 0;

    return (
      <View className="pb-md">
        <Typography
          variant="caption"
          weight="medium"
          className="mb-xs px-xs uppercase tracking-wide text-text-secondary"
        >
          {label}
        </Typography>
        <View
          className={[
            'flex-row items-center rounded-xl border bg-surface px-md',
            showError ? 'border-error' : 'border-border',
          ].join(' ')}
        >
          <TextInput
            value={value}
            onChangeText={onChangeText}
            onBlur={() => markTouched(fieldKey)}
            placeholder={options?.placeholder ?? `Enter ${label.toLowerCase()}`}
            placeholderTextColor="rgba(107, 114, 128, 0.5)"
            keyboardType={options?.keyboardType ?? 'default'}
            autoComplete={options?.autoComplete}
            textContentType={options?.textContentType}
            returnKeyType="done"
            className="flex-1 py-md text-body text-text-primary"
            accessibilityLabel={label}
          />
          {isFieldTouched && value.trim().length > 0 && (
            <Typography variant="caption" className="text-success">
              ✓
            </Typography>
          )}
        </View>
        {showError && (
          <Typography variant="caption" className="mt-xs px-xs text-error">
            {label} is required.
          </Typography>
        )}
      </View>
    );
  };

  const renderSectionCard = (section: SectionConfig) => {
    const status = sectionStatus[section.key];
    const isExpanded = expandedSection === section.key;
    const isCompleted = status;

    return (
      <View
        key={section.key}
        className={[
          'mb-md overflow-hidden rounded-xl border',
          isCompleted ? 'border-success/30' : 'border-border',
        ].join(' ')}
      >
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`${section.title} section, ${isCompleted ? 'completed' : 'not completed'}`}
          accessibilityHint="Tap to expand or collapse"
          onPress={() => toggleSection(section.key)}
          activeOpacity={0.7}
          className="flex-row items-center bg-surface px-md py-lg"
        >
          <View className="mr-md h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Typography variant="h2">{section.icon}</Typography>
          </View>

          <View className="flex-1">
            <Typography variant="body" weight="semibold" className="text-text-primary">
              {section.title}
            </Typography>
            <View className="mt-1 flex-row items-center gap-1">
              <View
                className={[
                  'h-2 w-2 rounded-full',
                  isCompleted ? 'bg-success' : 'bg-text-secondary',
                ].join(' ')}
              />
              <Typography
                variant="caption"
                className={isCompleted ? 'text-success' : 'text-text-secondary'}
              >
                {isCompleted ? 'Completed' : 'Not completed'}
              </Typography>
            </View>
          </View>

          <Typography
            variant="body"
            weight="medium"
            className="ml-sm text-text-secondary"
          >
            {isExpanded ? '−' : '+'}
          </Typography>
        </TouchableOpacity>

        {isExpanded && (
          <View className="border-t border-border bg-background px-md pb-sm pt-md">
            {renderSectionFields(section.key)}
          </View>
        )}
      </View>
    );
  };

  const renderSectionFields = (key: SectionKey) => {
    switch (key) {
      case 'personal':
        return (
          <>
            {renderInput('Full Name', form.fullName, (v) => updateField('fullName', v), 'fullName', {
              placeholder: 'Enter your full name',
              autoComplete: 'name',
              textContentType: 'name',
            })}
            {renderInput('Date of Birth', form.dateOfBirth, (v) => updateField('dateOfBirth', v), 'dateOfBirth', {
              placeholder: 'DD/MM/YYYY',
              autoComplete: 'birthdate-full',
              textContentType: 'birthdate',
            })}
          </>
        );

      case 'identity':
        return (
          <>
            <View className="pb-md">
              <Typography
                variant="caption"
                weight="medium"
                className="mb-xs px-xs uppercase tracking-wide text-text-secondary"
              >
                ID Type
              </Typography>
              <View className="gap-sm">
                {ID_TYPE_OPTIONS.map((option) => {
                  const selected = form.idType === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      accessibilityRole="radio"
                      accessibilityLabel={option.label}
                      accessibilityState={{ selected }}
                      onPress={() => {
                        updateField('idType', option.value);
                        markTouched('idType');
                      }}
                      className={[
                        'rounded-xl border-2 px-md py-sm',
                        selected ? 'border-primary bg-primary/10' : 'border-border bg-surface',
                      ].join(' ')}
                    >
                      <View className="flex-row items-center gap-md">
                        <View
                          className={[
                            'h-5 w-5 items-center justify-center rounded-full border-2',
                            selected ? 'border-primary bg-primary' : 'border-border',
                          ].join(' ')}
                        >
                          {selected && (
                            <Typography variant="caption" weight="bold" className="text-background">
                              ✓
                            </Typography>
                          )}
                        </View>
                        <Typography
                          variant="body"
                          weight={selected ? 'semibold' : 'regular'}
                          className={selected ? 'text-primary' : 'text-text-primary'}
                        >
                          {option.label}
                        </Typography>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {touched.has('idType') && form.idType === '' && (
                <Typography variant="caption" className="mt-xs px-xs text-error">
                  Please select an ID type.
                </Typography>
              )}
            </View>

            {renderInput(
              'Upload ID Document',
              form.idDocument,
              (v) => updateField('idDocument', v),
              'idDocument',
              { placeholder: 'Tap to upload ID document (front)' }
            )}
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Upload back side of ID"
              onPress={() => {
                /* file upload placeholder */
              }}
              className="flex-row items-center justify-center rounded-xl border-2 border-dashed border-border bg-surface py-md"
            >
              <Typography variant="body" className="text-text-secondary">
                + Upload back side (optional)
              </Typography>
            </TouchableOpacity>
          </>
        );

      case 'contact':
        return (
          <>
            {renderInput('Phone Number', form.phoneNumber, (v) => updateField('phoneNumber', v), 'phoneNumber', {
              placeholder: '+251 91 234 5678',
              keyboardType: 'phone-pad',
              autoComplete: 'tel',
              textContentType: 'telephoneNumber',
            })}
            {renderInput('Emergency Contact', form.emergencyContactName, (v) => updateField('emergencyContactName', v), 'emergencyContactName', {
              placeholder: 'Full name',
              autoComplete: 'name-family',
            })}
            {renderInput('Emergency Phone', form.emergencyContactPhone, (v) => updateField('emergencyContactPhone', v), 'emergencyContactPhone', {
              placeholder: '+251 91 234 5678',
              keyboardType: 'phone-pad',
              autoComplete: 'tel-device',
              textContentType: 'telephoneNumber',
            })}
          </>
        );

      case 'photo':
        return (
          <View className="items-center py-md">
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Upload profile photo"
              accessibilityHint="Tap to upload a profile photo"
              onPress={() => {
                updateField('profilePhoto', 'uploaded');
                markTouched('profilePhoto');
              }}
              className={[
                'h-28 w-28 items-center justify-center rounded-full border-2',
                form.profilePhoto.trim().length > 0
                  ? 'border-success bg-success-light'
                  : 'border-border bg-surface',
              ].join(' ')}
            >
              {form.profilePhoto.trim().length > 0 ? (
                <Typography variant="h1">✓</Typography>
              ) : (
                <>
                  <Typography variant="h2" className="text-text-secondary">
                    📷
                  </Typography>
                  <Typography variant="caption" color="secondary" className="mt-1 text-center">
                    Tap to upload
                  </Typography>
                </>
              )}
            </TouchableOpacity>
            {form.profilePhoto.trim().length > 0 ? (
              <Typography variant="caption" className="mt-sm text-success">
                Photo uploaded ✓
              </Typography>
            ) : (
              <Typography variant="caption" color="secondary" className="mt-sm">
                Upload a clear photo of your face
              </Typography>
            )}
            {touched.has('profilePhoto') && form.profilePhoto.trim().length === 0 && (
              <Typography variant="caption" className="mt-xs text-error">
                Profile photo is required.
              </Typography>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <View className="px-screen-padding pt-md">
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          testID="tasker-back-button"
          className="mb-xl h-xl w-xl items-center justify-center rounded-full active:opacity-60"
          hitSlop={8}
        >
          <ArrowLeft size={24} className="text-text-primary" />
        </TouchableOpacity>

        <Typography variant="h2" weight="bold" className="text-text-primary">
          Become a Tasker
        </Typography>

        <View className="mt-sm">
          <Typography variant="body" color="secondary" className="leading-relaxed">
            Complete verification to start receiving tasks.
          </Typography>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {SECTIONS.map(renderSectionCard)}
      </ScrollView>

      <View className="px-screen-padding pb-xl">
        <Button
          label="Continue"
          radius="lg"
          shadow={isContinueEnabled ? 'lg' : 'none'}
          disabled={!isContinueEnabled}
          onPress={handleContinue}
          testID="tasker-continue"
        />
      </View>
    </View>
  );
}
