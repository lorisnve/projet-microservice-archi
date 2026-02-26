import sequelize from './config/database.js';

const testConnexion = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connexion à la base de données réussie.');
  } catch (error) {
    console.error('Impossible de se connecter à la base de données :', error);
  } finally {
    await sequelize.close();
  }
};

testConnexion();