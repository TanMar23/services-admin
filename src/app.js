import { readFileSync } from 'node:fs';
import ServiceManager from './managers/ServiceManager.js';

const { services } = JSON.parse(
  readFileSync(new URL('./data/services.json', import.meta.url))
);

const manager = new ServiceManager(services);

console.log(manager.getServices())
