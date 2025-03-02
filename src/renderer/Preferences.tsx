import React, { useState, useEffect } from 'react';
import { StoreSchema } from '_/main/store';

function Preferences(): JSX.Element {
    const [didFetch, setDidFetch] = useState<boolean>(false);

    const [s3_BucketName, setS3BucketName] = useState<{value: string, stored: string}>();
    const [iam_accessKeyId, setIAMAccessKeyId] = useState<{value: string, stored: string}>();
    const [iam_secretAccessKey, setIAMSecretAccessKey] = useState<{value: string, stored: string}>();
    const [awsRegion, setAWSRegion] = useState<{value: string, stored: string}>();

    const [openOnStartup, setOpenOnStartup] = useState<{value: boolean, stored: boolean}>();
    const [transferDelay, setTransferDelay] = useState<{value: number, stored: number}>();

    const preferences = [s3_BucketName, iam_accessKeyId, iam_secretAccessKey, awsRegion, openOnStartup, transferDelay];

    useEffect(() => {
        if (!didFetch) {
            setDidFetch(true);
            fetchPreferences();
        }
    });

    /**
     * Fetches the preferences from the store.
     */
    async function fetchPreferences() {
        const awsCredentials = await window.ipcAPI?.storeGet('awsCredentials');
        setS3BucketName({value: awsCredentials.s3_BucketName, stored: awsCredentials.s3_BucketName});
        setIAMAccessKeyId({value: awsCredentials.iam_accessKeyId, stored: awsCredentials.iam_accessKeyId});
        setIAMSecretAccessKey({value: awsCredentials.iam_secretAccessKey, stored: awsCredentials.iam_secretAccessKey})
        setAWSRegion({value: awsCredentials.awsRegion, stored: awsCredentials.awsRegion});

        const preferences = await window.ipcAPI?.storeGet('preferences');
        setOpenOnStartup({value: preferences.openOnStartup, stored: preferences.openOnStartup});
        setTransferDelay({value: preferences.transferDelay, stored: preferences.transferDelay});
    }

    /**
     * Saves the edited preferences from the UI to the store so that they actually take effect.
     */
    async function savePreferences() {
        const awsCredentials = {
            s3_BucketName: s3_BucketName?.value,
            iam_accessKeyId: iam_accessKeyId?.value,
            iam_secretAccessKey: iam_secretAccessKey?.value,
            awsRegion: awsRegion?.value
        };
        await window.ipcAPI?.storeSet('awsCredentials', awsCredentials);

        const preferences = {
            openOnStartup: openOnStartup?.value,
            transferDelay: transferDelay?.value
        }
        await window.ipcAPI?.storeSet('preferences', preferences);
        
        // Set didFetch to false so that the stored values of all the preferences are updated.
        // This is done so that the UI input fields aren't marked as changed after saving the initial changes.
        // This could be done without fetching the preferences, but that sounds like a lot of work and I'm lazy so fuck it. ¯\_(ツ)_/¯
        setDidFetch(false);
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
        resetPreference(iam_accessKeyId!, setIAMAccessKeyId);
        resetPreference(iam_secretAccessKey!, setIAMSecretAccessKey)
        resetPreference(awsRegion!, setAWSRegion);
        resetPreference(openOnStartup!, setOpenOnStartup);
        resetPreference(transferDelay!, setTransferDelay);
    }

    // Determines if any of the preferences have changed.
    const preferencesChanged = !(preferences.every((preference) => preference?.value === preference?.stored));

    return (
        <div>
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
                        <div>IAM Access Key ID: {iam_accessKeyId?.value !== iam_accessKeyId?.stored && <span>*</span>}</div>
                        <input
                            type="text"
                            value={iam_accessKeyId?.value}
                            onChange={(e) => handlePreferenceChange(e.target.value, iam_accessKeyId!, setIAMAccessKeyId)}
                            onBlur={() => validateAWSCredential(iam_accessKeyId!, setIAMAccessKeyId)}
                        />
                    </label>
                    <br />
                    <label className="preferences-label">
                        <div>IAM Secret Access Key: {iam_secretAccessKey?.value !== iam_secretAccessKey?.stored && <span>*</span>}</div>
                        <input
                            type="text"
                            value={iam_secretAccessKey?.value}
                            onChange={(e) => handlePreferenceChange(e.target.value, iam_secretAccessKey!, setIAMSecretAccessKey)}
                            onBlur={() => validateAWSCredential(iam_secretAccessKey!, setIAMSecretAccessKey)}
                        />
                    </label>
                    <br />
                    <label className="preferences-label">
                        <div>AWS Region: {awsRegion?.value !== awsRegion?.stored && <span>*</span>}</div>
                        <input
                        type="text"
                        value={awsRegion?.value}
                        onChange={(e) => handlePreferenceChange(e.target.value, awsRegion!, setAWSRegion)}
                        onBlur={() => validateAWSCredential(awsRegion!, setAWSRegion)} 
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
