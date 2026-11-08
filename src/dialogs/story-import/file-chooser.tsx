import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {FileInput} from '../../components/control/file-input';
import {Story} from '../../store/stories';
import {importStories} from '../../util/import';
import {storyFromTwee} from '../../util/twee';

export interface FileChooserProps {
	onChange: (file: File, stories: Story[]) => void;
}

export const FileChooser: React.FC<FileChooserProps> = props => {
	const {onChange} = props;
	const {t} = useTranslation();

	function handleChange(file: File, data: string) {
		if (/\.html$/.test(file.name)) {
			onChange(file, importStories(data));
		} else {
			onChange(file, [storyFromTwee(data)]);
		}
	}

	const [url, setUrl] = React.useState('');
	const [status, setStatus] = React.useState('');
	const [busy, setBusy] = React.useState(false);

	async function handleUrlImport() {
		const trimmed = url.trim();

		if (!/^https?:\/\//i.test(trimmed)) {
			setStatus('Enter a full http(s) URL.');
			return;
		}

		setBusy(true);
		setStatus('Downloading…');

		try {
			const response = await fetch(trimmed);

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}`);
			}

			const data = await response.text();
			const name =
				decodeURIComponent(
					new URL(trimmed).pathname.split('/').pop() || 'imported.html'
				) || 'imported.html';
			const isTwee = /\.(twee|tw)$/i.test(name);

			setStatus('Reading stories…');
			const stories = isTwee ? [storyFromTwee(data)] : importStories(data);

			setStatus(
				stories.length > 0
					? `Found ${stories.length} story(s).`
					: 'No Twine stories found at that URL.'
			);
			onChange(
				new File([data], isTwee || /\.html?$/i.test(name) ? name : `${name}.html`),
				stories
			);
		} catch (e) {
			setStatus(
				`Could not import from URL: ${(e as Error).message}. The server must allow cross-origin requests (e.g. raw.githubusercontent.com).`
			);
		} finally {
			setBusy(false);
		}
	}

	return (
		<div className="file-chooser">
			<p className="url-import">
				<label>
					Or import from a public URL:{' '}
					<input
						aria-label="Story URL"
						onChange={e => setUrl(e.target.value)}
						placeholder="https://raw.githubusercontent.com/…/story.html"
						type="url"
						value={url}
					/>
				</label>{' '}
				<button disabled={busy} onClick={handleUrlImport} type="button">
					Import from URL
				</button>
			</p>
			{status && <p role="status">{status}</p>}
			<p>
				<FileInput
					accept=".html,.twee,.tw"
					onChange={handleChange}
					orientation="vertical"
				>
					{t('dialogs.storyImport.filePrompt')}
				</FileInput>
			</p>
		</div>
	);
};
