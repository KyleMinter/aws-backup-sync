import React, { useState, useEffect } from 'react';

function Preferences(): JSX.Element {
  const [didFetch, setDidFetch] = useState<boolean>(false);

  const [s3_BucketName, setS3BucketName] = useState<{value: string, stored: string}>();
  const [s3_ObjectKey, setS3ObjectKey] = useState<{value: string, stored: string}>();
  const [s3_awsRegion, setS3AWSRegion] = useState<{value: string, stored: string}>();

  const [openOnStartup, setOpenOnStartup] = useState<{value: boolean, stored: boolean}>();
  const [transferDelay, setTransferDelay] = useState<{value: number, stored: number}>();

  const preferences = [s3_BucketName, s3_ObjectKey, s3_awsRegion, openOnStartup, transferDelay];

  useEffect(() => {
    async function fetchPreferences() {
      const awsCredentials = await window.ipcAPI?.storeGet('awsCredentials');
      setS3BucketName({value: awsCredentials.s3_BucketName, stored: awsCredentials.s3_BucketName});
      setS3ObjectKey({value: awsCredentials.s3_ObjectKey, stored: awsCredentials.s3_ObjectKey});
      setS3AWSRegion({value: awsCredentials.s3_awsRegion, stored: awsCredentials.s3_awsRegion});
  
      const preferences = await window.ipcAPI?.storeGet('preferences');
      setOpenOnStartup({value: preferences.openOnStartup, stored: preferences.openOnStartup});
      setTransferDelay({value: preferences.transferDelay, stored: preferences.transferDelay});
    }

    if (!didFetch) {
      setDidFetch(true);
      fetchPreferences();
    }
  });

  /**
   * Saves the edited preferences from the UI to the store so that they actually take effect.
   */
  async function savePreferences() {
    const awsCredentials = {
      s3_BucketName: s3_BucketName?.value,
      s3_ObjectKey: s3_ObjectKey?.value,
      s3_awsRegion: s3_awsRegion?.value
    };
    await window.ipcAPI?.storeSet('awsCredentials', awsCredentials);

    const preferences = {
      openOnStartup: openOnStartup?.value,
      transferDelay: transferDelay?.value
    }
    await window.ipcAPI?.storeSet('preferences', preferences);
  }

  /**
   * Handle preference changes from the UI input fields.
   */
  function handlePreferenceChange<T>(change: T, preference: {value: T, stored: T}, set: (arg: {value: T, stored: T}) => void) {
    const changedPreference = {value: change, stored: preference.stored};
    set(changedPreference);
  }

  /**
   * Validate the AWS credentials in the UI input fields so that they cannot be empty.
   */
  function validateAWSCredential(preference: {value: string, stored: string}, set: (arg: {value: string, stored: string}) => void) {
    if (preference.value === '')
      resetPreference(preference, set);
  }

  /**
   * Resets a given preference state to its stored value.
   */
  function resetPreference<T>(preference: {value: T, stored: T}, set: (arg: {value: T, stored: T}) => void) {
    const storedValue = preference.stored;
    set({value: storedValue, stored: storedValue});
  }

  /**
   * Resets all preferences to their stored values.
   */
  function resetPreferences() {
    resetPreference(s3_BucketName!, setS3BucketName);
    resetPreference(s3_ObjectKey!, setS3ObjectKey);
    resetPreference(s3_awsRegion!, setS3AWSRegion);
    resetPreference(openOnStartup!, setOpenOnStartup);
    resetPreference(transferDelay!, setTransferDelay);
  }

  // Determines if any of the preferences have changed.
  let preferencesChanged = false;
  preferences.every((preference) => {
    if (preference?.value !== preference?.stored) {
      preferencesChanged = true;
      return false;
    }
  });

  return (
    <div className="preferences-container">
      <div>
        <h2>AWS Credentials</h2>
        <hr />
        <form className="preferences-form">
          <label className="preferences-label">
            <div>S3 Bucket Name: {s3_BucketName?.value !== s3_BucketName?.stored && <span>*</span>}</div>
            <input
              type="text"
              value={s3_BucketName?.value}
              onChange={(e) => handlePreferenceChange(e.target.value, s3_BucketName!, setS3BucketName)}
              onBlur={() => validateAWSCredential(s3_BucketName!, setS3BucketName)}  
            />
          </label>
          <br />
          <label className="preferences-label">
            <div>S3 Object Key: {s3_ObjectKey?.value !== s3_ObjectKey?.stored && <span>*</span>}</div>
            <input
              type="text"
              value={s3_ObjectKey?.value}
              onChange={(e) => handlePreferenceChange(e.target.value, s3_ObjectKey!, setS3ObjectKey)}
              onBlur={() => validateAWSCredential(s3_ObjectKey!, setS3ObjectKey)}
            />
          </label>
          <br />
          <label className="preferences-label">
            <div>AWS Region: {s3_awsRegion?.value !== s3_awsRegion?.stored && <span>*</span>}</div>
            <input
            type="text"
            value={s3_awsRegion?.value}
            onChange={(e) => handlePreferenceChange(e.target.value, s3_awsRegion!, setS3AWSRegion)}
            onBlur={() => validateAWSCredential(s3_awsRegion!, setS3AWSRegion)} 
          />
          </label>
        </form>
      </div>
      <div>
        <h2>General Preferences</h2>
        <hr />
        <form className="preferences-form">
          <label className="preferences-label">
            <div>Open on Startup: {openOnStartup?.value !== openOnStartup?.stored && <span>*</span>}</div>
            <input
              type="checkbox"
              checked={openOnStartup?.value}
              onChange={() => handlePreferenceChange(!(openOnStartup!.value), openOnStartup!, setOpenOnStartup)}
            />
          </label>
          <br />
          <label className="preferences-label">
          <div>Transfer Delay (mins): {transferDelay?.value !== transferDelay?.stored && <span>*</span>}</div>
            <input
            type="number"
            value={transferDelay?.value}
            onChange={(e) => {
              if (e.target.valueAsNumber > -1)
                handlePreferenceChange(e.target.valueAsNumber, transferDelay!, setTransferDelay);
              }}
            />
          </label>
        </form>
      </div>
      <div className="preferences-submit-container">
        <hr />
        <div>
          <span>{preferencesChanged && <p>You have unsaved changes. Click 'Save Changes' or else your changes won't be saved.<br /></p>}</span>
        </div>
        <div className="preferences-submit-buttons">
          <button type="button" onClick={() => savePreferences()}>Save Changes</button>
          <button type="button" onClick={() => resetPreferences()}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default Preferences;
