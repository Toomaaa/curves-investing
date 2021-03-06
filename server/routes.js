/**
 * Main application routes
 */

'use strict';

import errors from './components/errors';
import path from 'path';

export default function(app) {
  // Insert routes below
  app.use('/api/treasuryMoves', require('./api/treasuryMove'));
  app.use('/api/graphProgress', require('./api/graphProgress'));
  app.use('/api/yahooCaches', require('./api/yahooCache'));
  app.use('/api/trades', require('./api/trade'));
  app.use('/api/subscriptions', require('./api/subscription'));
  app.use('/api/clubsPeriods', require('./api/clubsPeriods'));
  app.use('/api/pendings', require('./api/pending'));
  app.use('/api/clubs', require('./api/club'));
  app.use('/api/things', require('./api/thing'));
  app.use('/api/users', require('./api/user'));

  app.use('/auth', require('./auth').default);

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get((req, res) => {
      res.sendFile(path.resolve(`${app.get('appPath')}/index.html`));
    });
}
