import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {App} from './app';
import './util/i18n';
import {installStorageFallback} from './util/storage-fallback';

if (installStorageFallback()) {
	console.warn('localStorage unavailable; using temporary in-memory storage.');
	const banner = document.createElement('div');
	banner.setAttribute('role', 'alert');
	banner.style.cssText =
		'position:fixed;bottom:0;left:0;right:0;z-index:99999;padding:6px;' +
		'background:#b00020;color:#fff;font:14px sans-serif;text-align:center';
	banner.textContent =
		'Browser storage is unavailable: your work is NOT saved and will be ' +
		'lost when this tab closes or reloads. Use Library > Archive (or ' +
		'Build > Publish to File) to download your stories before leaving.';
	document.body.appendChild(banner);
}

ReactDOM.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
	document.getElementById('root')
);
