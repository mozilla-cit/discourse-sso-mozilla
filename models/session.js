module.exports = function (sequelize, DataTypes) {
  var Session = sequelize.define('Session', {
    sid: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    expires: DataTypes.DATE,
    data: DataTypes.TEXT
  })
  return Session
}
