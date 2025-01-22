import React, { useState, useEffect } from 'react';

function Preferences(): JSX.Element {

  const [s3_BucketName, setS3BucketName] = useState('');
  const [s3_ObjectKey, setS3ObjectKey] = useState('');
  const [s3_awsRegion, setS3AWSRegion] = useState('');

  const [preferencesChanged, setPreferencesChanged] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  useEffect(() => {
    fetchPreferences();
  }, []);
  
  async function fetchPreferences() {
    const awsCredentials = await window.ipcAPI?.storeGet('awsCredentials');

    setS3BucketName(awsCredentials.s3_BucketName);
    setS3ObjectKey(awsCredentials.s3_ObjectKey);
    setS3AWSRegion(awsCredentials.s3_awsRegion);
  }

  async function savePreferencesToStore() {
    const awsCredentials = {
      s3_BucketName: s3_BucketName,
      s3_ObjectKey: s3_ObjectKey,
      s3_awsRegion: s3_awsRegion
    };

    await window.ipcAPI?.storeSet('awsCredentials', awsCredentials);
  }

  async function onSaveChanges() {
    if (preferencesChanged)
    {
      let error: boolean = false;
      const messages: string[] = [];
      
      if (s3_BucketName === '') {
          error = true;
          messages.push('S3 Bucket Name must not be empty.');
      }

      if (s3_ObjectKey === '') {
          error = true;
          messages.push('S3 Object Key must not be empty.');
      }

      if (s3_awsRegion === '') {
        error = true;
        messages.push('AWS Region must not be empty.');
      }

      if (error)
        setErrorMessages(messages);
      else
      {
        setErrorMessages([]);
        setPreferencesChanged(false);
        await savePreferencesToStore();
      }
    }
  }

  return (
    <div className="app">
      <h1>Preferences</h1>
      <div>
        <h2>AWS Credentials</h2>
        <form>
          <label>
            S3 Bucket Name:
            <input type="text" value={s3_BucketName} onChange={(e) => {setPreferencesChanged(true); setS3BucketName(e.target.value);}} />
          </label>
          <br />
          <label>
            S3 Object Key:
            <input type="text" value={s3_ObjectKey} onChange={(e) => {setPreferencesChanged(true); setS3ObjectKey(e.target.value);}} />
          </label>
          <br />
          <label>
            AWS Region:
            <input type="text" value={s3_awsRegion} onChange={(e) => {setPreferencesChanged(true); setS3AWSRegion(e.target.value);}} />
          </label>
        </form>
      </div>
      <div>
        <div>
          {errorMessages.length !== 0 && errorMessages.map(message => (<p>{message}<br /></p>))}
          {preferencesChanged && <p>You have unsaved changes. Click 'Save Changes' or else your changes won't be saved.<br /></p>}
        </div>
        <button type="button" onClick={() => onSaveChanges()}>Save Changes</button>
        <button type="button" onClick={() => {setErrorMessages([]); setPreferencesChanged(false); fetchPreferences()}}>Cancel</button>
      </div>
    </div>
  );
}

export default Preferences;
