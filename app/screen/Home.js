import { RefreshControl, StyleSheet, Text, View, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { FontAwesome } from '@expo/vector-icons';
import moment from 'moment';
import db from '../../api/src/model/db';
import { SafeAreaView } from 'react-native-safe-area-context';

const Home = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [name, setName] = useState(false);
  const TodayDate = moment().format('DD-MM-YYYY');
  const [TodayCourseItems, setTodayCourseItems] = useState([]);

  const refreshData = () => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM class WHERE selectedDate='${TodayDate}' ORDER BY selectedStartTime ASC`,
        [],
        (txObj, resultSet) => setTodayCourseItems(resultSet.rows._array),
        error => console.log(error)
      );
    });

    db.transaction(tx => {
      tx.executeSql(
        `SELECT user FROM class_user`,
        [],
        (txObj, resultSet) => {
          if (resultSet.rows.length > 0) {
            const firstRow = resultSet.rows.item(0);
            const { user } = firstRow;
            setName(user);
          }
        },
        error => console.log(error)
      );
    });
  };

  useFocusEffect(
    React.useCallback(() => {
      refreshData();
    }, [])
  );

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      refreshData();
      setRefreshing(false);
    }, 500);
  }, []);

  const getCurrentClass = () => {
    const currentTime = moment();
    for (let i = 0; i < TodayCourseItems.length; i++) {
      const startTime = moment(TodayCourseItems[i].selectedStartTime, 'hh:mm A');
      const endTime = moment(TodayCourseItems[i].selectedEndTime, 'hh:mm A');
      if (currentTime.isBetween(startTime, endTime)) {
        return TodayCourseItems[i];
      }
    }
    return null;
  };

  const getNextClass = () => {
    const currentTime = moment();
    for (let i = 0; i < TodayCourseItems.length; i++) {
      const startTime = moment(TodayCourseItems[i].selectedStartTime, 'hh:mm A');
      if (currentTime.isBefore(startTime)) {
        return TodayCourseItems[i];
      }
    }
    return null;
  };

  const currentClass = getCurrentClass();
  const nextClass = getNextClass();

  return (
    <SafeAreaView>
      <ScrollView refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
        <View style={{ padding: wp(5), backgroundColor: "#FDFDFD" }}>
          <Text style={styles.welcome}>Hello {name ? name : "JOHN DOE"}</Text>
          <Text style={styles.highlight}>{TodayCourseItems.length > 0 ? TodayCourseItems.length : "NO"} classes Today</Text>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: wp(7), fontWeight: '700', marginTop: hp(1) }}>Now</Text>
            <View style={styles.card}>
              <View style={styles.flex_row}>
                <Text style={[{ fontSize: wp(10), color: "white", fontWeight: '700' }, { marginLeft: getCurrentClass() ? "" : hp(5) }]}>
                  {getCurrentClass() ? getCurrentClass().courseCode : "No class now"}
                </Text>
              </View>
              <View>
                <Text style={{ color: "white", fontWeight: '700' }}>
                  {getCurrentClass() ? `Building: `+getCurrentClass().building : ""}
                </Text>
                <View style={styles.flex_row}>
                  <Text style={{ color: "white", fontWeight: '700' }}>{getCurrentClass() ?`FC: `+ getCurrentClass().faculty : ""}</Text>
                  <Text style={{ color: "white", fontWeight: '700' }}>
                    {getCurrentClass() ? `${getCurrentClass().selectedStartTime}-${getCurrentClass().selectedEndTime}` : ""}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: wp(6), fontWeight: '700', marginTop: hp(1) }}>Next</Text>
            <View style={styles.card_next}>
              <View style={styles.flex_row}>
                <Text style={{ fontSize: wp(9), color: "#777377" }}>
                  {getNextClass() ? getNextClass().courseCode : "No more classes"}
                </Text>
              </View>
              <View>
                <Text style={styles.color_777377}>{getNextClass() ?`Building:  ` +getNextClass().building : ""}</Text>
                <View style={styles.flex_row}>
                  <Text style={styles.color_777377}> {getNextClass() ? `FC: `+getNextClass().faculty : ""}</Text>
                  <Text style={styles.color_777377}>
                    {getNextClass() ? `${getNextClass().selectedStartTime}-${getNextClass().selectedEndTime}` : ""}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <View>
            <Text style={{ textAlign: "center", fontSize: wp(5), fontWeight: '700', marginTop: hp(1) }}>Today's classes</Text>
          </View>
        </View>
        <View>
          {TodayCourseItems.map((courseItem, index) => (
            <View key={index} style={{ width: wp(94), margin: wp(1), marginHorizontal: wp(3), padding: wp(4), paddingHorizontal: wp(6), flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#323232', borderRadius: wp(5) }}>
              <View style={{ width: wp(60) }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={[styles.text]}>{courseItem.courseCode}</Text>
                  <Text style={[styles.text]}>B:{courseItem.building}</Text>
                  <Text style={[styles.text]}>{courseItem.selectedStartTime}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={[styles.text]}>{courseItem.faculty}</Text>
                  <Text style={[styles.text]}>R: {courseItem.room}</Text>
                  <Text style={[styles.text]}>{courseItem.selectedEndTime}</Text>
                </View>
                <View>
                  <Text style={[styles.note]}>Note: {courseItem.note}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
};

export default Home;

const styles = StyleSheet.create({
  welcome: {
    fontSize: wp(9),
    fontWeight: '700',
    color: '#1d1d1d',
  },
  color_777377: {
    color: "#777377"
  },
  highlight: {
    fontSize: wp(6),
    color: "#007aff",
    fontWeight: "700"
  },
  flex_row: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between"
  },
  card: {
    width: wp(90), backgroundColor: "#007aff", padding: wp(3), borderRadius: 10, marginTop: hp(1), marginBottom: hp(1)
  },
  card_next: {
    width: wp(75), backgroundColor: '#B0BCBC', padding: wp(3), borderRadius: 10, marginTop: hp(1), marginBottom: hp(1)
  },
  color_white: {
    color: "white",
  },
  text: {
    width: wp(20),
    color: 'white',
    fontWeight: '500',
  },
  note: {
    width: wp(60),
    color: 'white',
    fontWeight: '500',
  }
});
