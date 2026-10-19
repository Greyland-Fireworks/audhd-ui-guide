import { mount } from 'svelte';
import App from './App.svelte';
import '../../../skins/skins.css';
import '../../shared/tokens.css';
import './styles.css';

mount(App, { target: document.getElementById('app') });
