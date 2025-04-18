function toSnakeCase(str) {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`).toLowerCase();
  }
  
  function toMigrationName(tableName) {
    return `create_${toSnakeCase(tableName)}_table`;
  }
  
  // Convertit ex: "mouvement_id" => "Mouvement", "date_mouvement" => "Date Mouvement"
  function humanizeLabel(str) {
    return str
      .replace(/_id$/, '')                          // retire les suffixes _id
      .replace(/_/g, ' ')                           // remplace les underscores par des espaces
      .replace(/\b\w/g, char => char.toUpperCase()); // met la 1ère lettre de chaque mot en majuscule
  }
  
  // Ex: "mouvements_stock" => "Mouvements Stock", "user_roles" => "User Roles"
  function humanizeTitle(str) {
    return str
      .replace(/_/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  }
  
  // Ex: "mouvements_stock" => "Créer un Mouvement Stock"
  function getCreateTitle(modelName) {
    const cleanName = humanizeTitle(modelName.replace(/s$/, '')); // enlever le "s" final au besoin
    return `Créer un ${cleanName}`;
  }
  
  // Ex: "mouvements_stock" => "Modifier un Mouvement Stock"
  function getEditTitle(modelName) {
    const cleanName = humanizeTitle(modelName.replace(/s$/, ''));
    return `Modifier un ${cleanName}`;
  }
  
  module.exports = {
    toSnakeCase,
    toMigrationName,
    humanizeLabel,
    humanizeTitle,
    getCreateTitle,
    getEditTitle
  };
  