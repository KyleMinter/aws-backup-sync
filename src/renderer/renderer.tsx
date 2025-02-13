/**
 * React renderer.
 */
// Import the styles here to process them with webpack
import '_public/style.css';
import '_public/window.css';
import '_public/navbar.css';
import '_public/about.css';
import '_public/preferences.css';
import '_public/folders.css';

import * as React from 'react';
import { createRoot } from 'react-dom/client';
import Window from '_renderer/Window';

const container = document.body;
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(container!);
root.render(<Window />);
