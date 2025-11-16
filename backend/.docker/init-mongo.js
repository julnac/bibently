db = db.getSiblingDB('bibently');

db.createUser({
    user: 'bibently_user',
    pwd: 'bibently_password',
    roles: [
        { role: 'readWrite', db: 'bibently' }
    ]
});
