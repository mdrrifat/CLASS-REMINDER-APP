import { View, Text,Platform } from 'react-native'
import React from 'react'

import * as SQLite from "expo-sqlite";

function openDatabase() {
  if (Platform.OS === "web") {
    return {
      transaction: () => {
        return {
          executeSql: () => {},
        };
      },
    };
  }
  const db = SQLite.openDatabase("classFinder.db");
  return db;
}



const db = openDatabase();

export default db