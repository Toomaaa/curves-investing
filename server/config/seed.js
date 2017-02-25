/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';
import Thing from '../api/thing/thing.model';
import User from '../api/user/user.model';
import Club from '../api/club/club.model';
import Pending from '../api/pending/pending.model';
import ClubsPeriods from '../api/clubsPeriods/clubsPeriods.model';
import Subscriptions from '../api/subscription/subscription.model';

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
      _id: "58b1f0fe567162101847befb",
      isActivated: true,
      firstName: 'Thomas',
      lastName: 'Anicotte',
      email: 'tanicotte@gmail.com',
      role: 'user',
      password: 'test',
      isPasswordSet: true,
      individualAccount: true,
      isPartOfClub: true,
      club: [ {
        clubCode: '43W0K',
        clubName: 'BIC',
        function: 'treasurer'
      } , {
        clubCode: 'AAAAA',
        clubName: 'TRUC',
        function: 'member'
      } ],
      accountSelected : { 
        type : "individual", 
        clubCode : "", 
        clubName : "", 
        function : "" 
      }
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
        email : "guillaume.bruno@gmail.com", 
        function : "president", 
        lastName : "Bruno", 
        firstName : "Guillaume",
        entryDate : "2016-09-01T22:00:00Z"
      }, 
      treasurer : { 
        email : "tanicotte@gmail.com", 
        function : "treasurer", 
        lastName : "Anicotte", 
        firstName : "Thomas",
        entryDate : "2016-09-01T22:00:00Z"
      }, 
      pendingApproval : [ ], 
      members : [ 
        { 
          email : "julien@merchandising.io", 
          function : "member", 
          lastName : "Decroix", 
          firstName : "Julien",
          entryDate : "2016-09-01T22:00:00Z"
        }, { 
          email : "antoine@merchandising.io", 
          function : "member", 
          lastName : "Bruno", 
          firstName : "Antoine",
          entryDate : "2016-09-01T22:00:00Z"
        }, { 
          email : "ringotmarc@gmail.com", 
          function : "member", 
          lastName : "Ringot", 
          firstName : "Marc",
          entryDate : "2016-09-01T22:00:00Z"
        }, { 
          email : "karim.bounab@gmail.com", 
          function : "member", 
          lastName : "Bounab", 
          firstName : "Karim",
          entryDate : "2016-09-01T22:00:00Z"
        } 
      ]
    } , {
      clubCode : "AAAAA", 
      clubName : "TRUC", 
      initialAmount : 999, 
      monthlyAmount : 999, 
      shareAmount : 999, 
      creationDate : "2016-09-01T22:00:00Z", 
      exitPercentage : 999, 
      president : { 
        email : "test@aaaaa.fr", 
        function : "president", 
        lastName : "PAAAAA", 
        firstName : "PAAAAA",
        entryDate : "2016-09-01T22:00:00Z" 
      }, 
      treasurer : { 
        email : "test@aaaaa.fr2", 
        function : "treasurer", 
        lastName : "TAAAAA", 
        firstName : "TAAAAA",
        entryDate : "2016-09-01T22:00:00Z"
      }, 
      pendingApproval : [ ], 
      members : [ 
        { 
          email : "test@aaaaa.fr3", 
          function : "member", 
          lastName : "MAAAAA", 
          firstName : "MAAAAA",
          entryDate : "2016-09-01T22:00:00Z"
        }, { 
          email : "test@aaaaa.fr4", 
          function : "member", 
          lastName : "MAAAAA", 
          firstName : "MAAAAA",
          entryDate : "2016-09-01T22:00:00Z"
        }, { 
          email : "test@aaaaa.fr5", 
          function : "member", 
          lastName : "MAAAAA", 
          firstName : "MAAAAA",
          entryDate : "2016-09-01T22:00:00Z"
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
      email : "guillaume.bruno@gmail.com",
      lastName : "Bruno", 
      firstName : "Guillaume",
      "activationCode" : "QBZHSYDR35VLEWDMZRIB", 
      "club" : [ { 
        "function" : "president", 
        "clubCode" : "43W0K" 
      } ] 
    }, { 
      email : "julien@merchandising.io",
      lastName : "Decroix", 
      firstName : "Julien",
      "activationCode" : "4BBESS49FHA2FY1NFCLB", 
      "club" : [ { 
        "function" : "member", 
        "clubCode" : "43W0K" 
      } ] 
    }, { 
      email : "antoine@merchandising.io",
      lastName : "Bruno", 
      firstName : "Antoine",
      "activationCode" : "SKP9VRSA613HEJZGNGJO", 
      "club" : [ { 
        "function" : "member", 
        "clubCode" : "43W0K" 
      } ] 
    }, { 
      email : "ringotmarc@gmail.com",
      lastName : "Ringot", 
      firstName : "Marc",
      "activationCode" : "CWDRBJ17GEOMXKCOE7V6", 
      "club" : [ { 
        "function" : "member", 
        "clubCode" : "43W0K" 
      } ] 
    }, { 
      email : "karim.bounab@gmail.com",
      lastName : "Bounab", 
      firstName : "Karim",
      "activationCode" : "99999999999999999999", 
      "club" : [ { 
        "function" : "member", 
        "clubCode" : "43W0K" 
      } ] 
    })
    .then(() => {
      console.log('finished populating pendings users');
    });
  });


ClubsPeriods.find({}).remove()
  .then(() => {
    ClubsPeriods.create({
      "clubCode" : "43W0K", 
      "periods" : [ "2016-09-01T22:00:00Z", "2016-10-05T22:00:00.000Z", "2016-11-02T23:00:00.000Z", "2016-11-30T23:00:00.000Z", "2017-01-04T23:00:00.000Z", "2017-02-01T23:00:00.000Z", "2017-03-01T23:00:00.000Z", "2017-04-05T22:00:00.000Z", "2017-05-03T22:00:00.000Z", "2017-05-31T22:00:00.000Z", "2017-07-05T22:00:00.000Z", "2017-08-02T22:00:00.000Z", "2017-09-06T22:00:00.000Z", "2017-10-04T22:00:00.000Z", "2017-11-01T23:00:00.000Z", "2017-12-06T23:00:00.000Z", "2018-01-03T23:00:00.000Z", "2018-01-31T23:00:00.000Z", "2018-02-28T23:00:00.000Z", "2018-04-04T22:00:00.000Z", "2018-05-02T22:00:00.000Z", "2018-06-06T22:00:00.000Z", "2018-07-04T22:00:00.000Z", "2018-08-01T22:00:00.000Z", "2018-09-05T22:00:00.000Z", "2018-10-03T22:00:00.000Z", "2018-10-31T23:00:00.000Z", "2018-12-05T23:00:00.000Z", "2019-01-02T23:00:00.000Z", "2019-02-06T23:00:00.000Z", "2019-03-06T23:00:00.000Z", "2019-04-03T22:00:00.000Z", "2019-05-01T22:00:00.000Z", "2019-06-05T22:00:00.000Z", "2019-07-03T22:00:00.000Z", "2019-07-31T22:00:00.000Z", "2019-09-04T22:00:00.000Z", "2019-10-02T22:00:00.000Z", "2019-11-06T23:00:00.000Z", "2019-12-04T23:00:00.000Z", "2020-01-01T23:00:00.000Z", "2020-02-05T23:00:00.000Z", "2020-03-04T23:00:00.000Z", "2020-04-01T22:00:00.000Z", "2020-05-06T22:00:00.000Z", "2020-06-03T22:00:00.000Z", "2020-07-01T22:00:00.000Z", "2020-08-05T22:00:00.000Z", "2020-09-02T22:00:00.000Z", "2020-09-30T22:00:00.000Z", "2020-11-04T23:00:00.000Z", "2020-12-02T23:00:00.000Z", "2021-01-06T23:00:00.000Z", "2021-02-03T23:00:00.000Z", "2021-03-03T23:00:00.000Z", "2021-03-31T22:00:00.000Z", "2021-05-05T22:00:00.000Z", "2021-06-02T22:00:00.000Z", "2021-06-30T22:00:00.000Z", "2021-08-04T22:00:00.000Z", "2021-09-01T22:00:00.000Z", "2021-10-06T22:00:00.000Z", "2021-11-03T23:00:00.000Z", "2021-12-01T23:00:00.000Z", "2022-01-05T23:00:00.000Z", "2022-02-02T23:00:00.000Z", "2022-03-02T23:00:00.000Z", "2022-04-06T22:00:00.000Z", "2022-05-04T22:00:00.000Z", "2022-06-01T22:00:00.000Z", "2022-07-06T22:00:00.000Z", "2022-08-03T22:00:00.000Z", "2022-08-31T22:00:00.000Z", "2022-10-05T22:00:00.000Z", "2022-11-02T23:00:00.000Z", "2022-11-30T23:00:00.000Z", "2023-01-04T23:00:00.000Z", "2023-02-01T23:00:00.000Z", "2023-03-01T23:00:00.000Z", "2023-04-05T22:00:00.000Z", "2023-05-03T22:00:00.000Z", "2023-05-31T22:00:00.000Z", "2023-07-05T22:00:00.000Z", "2023-08-02T22:00:00.000Z", "2023-09-06T22:00:00.000Z", "2023-10-04T22:00:00.000Z", "2023-11-01T23:00:00.000Z", "2023-12-06T23:00:00.000Z", "2024-01-03T23:00:00.000Z", "2024-01-31T23:00:00.000Z", "2024-03-06T23:00:00.000Z", "2024-04-03T22:00:00.000Z", "2024-05-01T22:00:00.000Z", "2024-06-05T22:00:00.000Z", "2024-07-03T22:00:00.000Z", "2024-07-31T22:00:00.000Z", "2024-09-04T22:00:00.000Z", "2024-10-02T22:00:00.000Z", "2024-11-06T23:00:00.000Z", "2024-12-04T23:00:00.000Z", "2025-01-01T23:00:00.000Z", "2025-02-05T23:00:00.000Z", "2025-03-05T23:00:00.000Z", "2025-04-02T22:00:00.000Z", "2025-04-30T22:00:00.000Z", "2025-06-04T22:00:00.000Z", "2025-07-02T22:00:00.000Z", "2025-08-06T22:00:00.000Z", "2025-09-03T22:00:00.000Z", "2025-10-01T22:00:00.000Z", "2025-11-05T23:00:00.000Z", "2025-12-03T23:00:00.000Z", "2025-12-31T23:00:00.000Z", "2026-02-04T23:00:00.000Z", "2026-03-04T23:00:00.000Z", "2026-04-01T22:00:00.000Z", "2026-05-06T22:00:00.000Z", "2026-06-03T22:00:00.000Z", "2026-07-01T22:00:00.000Z", "2026-08-05T22:00:00.000Z" ]
    })
    .then(() => {
      console.log('finished populating club periods');
    });
  });


Subscriptions.find({}).remove()
  .then(() => {
    Subscriptions.create({
      email: 'guillaume.bruno@gmail.com',
      clubCode: '43W0K',
      period: "2016-09-01T22:00:00Z",
      amount: 0,
      type: 'initial'
    }, {
      email: 'tanicotte@gmail.com',
      clubCode: '43W0K',
      period: "2016-09-01T22:00:00Z",
      amount: 0,
      type: 'initial'
    }, {
      email: 'julien@merchandising.io',
      clubCode: '43W0K',
      period: "2016-09-01T22:00:00Z",
      amount: 0,
      type: 'initial'
    }, {
      email: 'antoine@merchandising.io',
      clubCode: '43W0K',
      period: "2016-09-01T22:00:00Z",
      amount: 0,
      type: 'initial'
    }, {
      email: 'ringotmarc@gmail.com',
      clubCode: '43W0K',
      period: "2016-09-01T22:00:00Z",
      amount: 0,
      type: 'initial'
    }, {
      email: 'karim.bounab@gmail.com',
      clubCode: '43W0K',
      period: "2016-09-01T22:00:00Z",
      amount: 0,
      type: 'initial'
    },
    { "email" : "guillaume.bruno@gmail.com", "clubCode" : "43W0K", "period" : "2016-09-01T22:00:00Z", "amount" : 100, "type" : "recurrent", "__v" : 0 },
    { "email" : "tanicotte@gmail.com", "clubCode" : "43W0K", "period" : "2016-09-01T22:00:00Z", "amount" : 100, "type" : "recurrent", "__v" : 0 },
    { "email" : "julien@merchandising.io", "clubCode" : "43W0K", "period" : "2016-09-01T22:00:00Z", "amount" : 100, "type" : "recurrent", "__v" : 0 },
    { "email" : "antoine@merchandising.io", "clubCode" : "43W0K", "period" : "2016-09-01T22:00:00Z", "amount" : 100, "type" : "recurrent", "__v" : 0 },
    { "email" : "ringotmarc@gmail.com", "clubCode" : "43W0K", "period" : "2016-09-01T22:00:00Z", "amount" : 100, "type" : "recurrent", "__v" : 0 },
    { "email" : "karim.bounab@gmail.com", "clubCode" : "43W0K", "period" : "2016-09-01T22:00:00Z", "amount" : 100, "type" : "recurrent", "__v" : 0 },
    { "email" : "guillaume.bruno@gmail.com", "clubCode" : "43W0K", "period" : "2016-10-05T22:00:00Z", "amount" : 100, "type" : "recurrent", "__v" : 0 },
    { "email" : "tanicotte@gmail.com", "clubCode" : "43W0K", "period" : "2016-10-05T22:00:00Z", "amount" : 100, "type" : "recurrent", "__v" : 0 },
    { "email" : "julien@merchandising.io", "clubCode" : "43W0K", "period" : "2016-10-05T22:00:00Z", "amount" : 100, "type" : "recurrent", "__v" : 0 },
    { "email" : "antoine@merchandising.io", "clubCode" : "43W0K", "period" : "2016-10-05T22:00:00Z", "amount" : 100, "type" : "recurrent", "__v" : 0 },
    { "email" : "ringotmarc@gmail.com", "clubCode" : "43W0K", "period" : "2016-10-05T22:00:00Z", "amount" : 100, "type" : "recurrent", "__v" : 0 },
    { "email" : "karim.bounab@gmail.com", "clubCode" : "43W0K", "period" : "2016-10-05T22:00:00Z", "amount" : 100, "type" : "recurrent", "__v" : 0 }
    )
    .then(() => {
      console.log('finished populating user subscriptions');
    });
  });

