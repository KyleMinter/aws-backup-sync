import React from 'react';

function About(): JSX.Element {
  return (
    <div className="about-container">
      <div className="about-main-content">
        <p>AWS Backup Sync is a cross compatible electron tray app that automatically watches and backup/syncs user specified directories to cloud storage. It includes various user preference options and leverages AWS S3 as a cloud storage provider.</p>
        <p>This app was built using Electron, React, AWS, and other various libraries which you can find on the github page.</p>
      </div>
      <hr />
      <div className="about-links">
        <p>Author: Kyle Minter</p>
        <p>Github: <a href="https://github.com/KyleMinter/aws-backup-sync" target="_blank">https://github.com/KyleMinter/aws-backup-sync</a></p>
        <p>Portfolio: <a href="https://kyleminter.github.io" target="_blank">https://kyleminter.github.io</a></p>
      </div>
    </div>
  );
}

export default About;
