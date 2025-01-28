import React from 'react';

function About(): JSX.Element {
  return (
    <div className="app">
      <h1>About</h1>
      <div>
        <p>AWS Backup Sync is a cross compatible electron tray app that automatically watches and backup/syncs user specified directories to cloud storage. It includes various user preference options and leverages AWS S3 as a cloud storage provider.</p>
        <p>This app was built using Electron, React, AWS, and other various libraries which you can find on the github page.</p>
      </div>
      <div>
        <p>Author: Kyle Minter</p>
        <p>{"Github: <insert link>"}</p>
        <p>{"Portfolio: <insert link>"}</p>
      </div>
    </div>
  );
}

export default About;
