import './domain/space.less';
import './domain/live.less';
import './domain/game.less';

import './global.less';
import './map.less';
import './theme/dark.less';

document.documentElement.classList.add('bili_dark');
const hostnames = window.location.hostname.split('.');
if (hostnames.length > 0) {
  const domain = hostnames[0].trim();
  const themeClassName = `bili_domain_${domain}`;
  document.documentElement.classList.add(themeClassName);
}