/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';
import Thing from '../api/thing/thing.model';
import User from '../api/user/user.model';
import Club from '../api/club/club.model';
import Pending from '../api/pending/pending.model';

Thing.find({}).remove()
  .then(() => {
    Thing.create({
      name: 'Development Tools',
      info: 'Integration with popular tools such as Webpack, Gulp, Babel, TypeScript, Karma, '
            + 'Mocha, ESLint, Node Inspector, Livereload, Protractor, Pug, '
            + 'Stylus, Sass, and Less.'
    }, {
      name: 'Server and Client integration',
      info: 'Built with a powerful and fun stack: MongoDB, Express, '
            + 'AngularJS, and Node.'
    }, {
      name: 'Smart Build System',
      info: 'Build system ignores `spec` files, allowing you to keep '
            + 'tests alongside code. Automatic injection of scripts and '
            + 'styles into your index.html'
    }, {
      name: 'Modular Structure',
      info: 'Best practice client and server structures allow for more '
            + 'code reusability and maximum scalability'
    }, {
      name: 'Optimized Build',
      info: 'Build process packs up your templates as a single JavaScript '
            + 'payload, minifies your scripts/css/images, and rewrites asset '
            + 'names for caching.'
    }, {
      name: 'Deployment Ready',
      info: 'Easily deploy your app to Heroku or Openshift with the heroku '
            + 'and openshift subgenerators'
    });
  });

User.find({}).remove()
  .then(() => {
    User.create({
      provider: 'local',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'test'
    }, {
      provider: 'local',
      role: 'admin',
      firstName: 'Admin',
      lastName: 'Admin',
      email: 'admin@example.com',
      password: 'admin'
    }, {
      isActivated: true,
      firstName: 'P',
      lastName: 'P',
      email: 'test@test.fr',
      role: 'user',
      password: 'test',
      isPasswordSet: true,
      individualAccount: true,
      isPartOfClub: true,
      club: [ {
        clubCode: '43W0K',
        clubName: 'BIC',
        function: 'president'
      } , {
        clubCode: 'AAAAA',
        clubName: 'TRUC',
        function: 'member'
      } ]
    })
    .then(() => {
      console.log('finished populating users');
    });
  });


Club.find({}).remove()
  .then(() => {
    Club.create({
      clubCode : "43W0K", 
      clubName : "BIC", 
      initialAmount : 0, 
      monthlyAmount : 100, 
      shareAmount : 1, 
      creationDate : "2016-09-01T22:00:00Z", 
      exitPercentage : 2, 
      president : { 
        email : "test@test.fr", 
        function : "president", 
        lastName : "P", 
        firstName : "P" 
      }, 
      treasurer : { 
        email : "test@test.fr2", 
        function : "treasurer", 
        lastName : "T", 
        firstName : "T" 
      }, 
      pendingApproval : [ ], 
      members : [ 
        { 
          email : "test@test.fr3", 
          function : "member", 
          lastName : "M", 
          firstName : "M" 
        }, { 
          email : "test@test.fr4", 
          function : "member", 
          lastName : "M", 
          firstName : "M" 
        }, { 
          email : "test@test.fr5", 
          function : "member", 
          lastName : "M", 
          firstName : "M" 
        } 
      ]
    })
    .then(() => {
      console.log('finished populating clubs');
    });
  });


Pending.find({}).remove()
  .then(() => {
    Pending.create({ 
      "firstName" : "T", 
      "lastName" : "T", 
      "email" : "test@test.fr2", 
      "activationCode" : "QBZHSYDR35VLEWDMZRIB", 
      "club" : [ { 
        "function" : "treasurer", 
        "clubCode" : "43W0K" 
      } ] 
    }, { 
      "firstName" : "M", 
      "lastName" : "M", 
      "email" : "test@test.fr3", 
      "activationCode" : "4BBESS49FHA2FY1NFCLB", 
      "club" : [ { 
        "function" : "member", 
        "clubCode" : "43W0K" 
      } ] 
    }, { 
      "firstName" : "M", 
      "lastName" : "M", 
      "email" : "test@test.fr4", 
      "activationCode" : "SKP9VRSA613HEJZGNGJO", 
      "club" : [ { 
        "function" : "member", 
        "clubCode" : "43W0K" 
      } ] 
    }, { 
      "firstName" : "M", 
      "lastName" : "M", 
      "email" : "test@test.fr5", 
      "activationCode" : "CWDRBJ17GEOMXKCOE7V6", 
      "club" : [ { 
        "function" : "member", 
        "clubCode" : "43W0K" 
      } ] 
    })
    .then(() => {
      console.log('finished populating pendings users');
    });
  });