import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableWithoutFeedback,
  Dimensions,
  TouchableOpacity,
  TextInput,
  Button,
  ScrollView,
  FlatList,
  Platform,
  Switch,
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import moment from "moment";
import Modal from "react-native-modal";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Calendar from "../components/horizontal_date/Calender";
import { AntDesign, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import db from "../../api/src/model/db";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

const { width } = Dimensions.get("window");

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const Routine = () => {
  const swiper = useRef();
  const [value, setValue] = useState(new Date());
  const [week, setWeek] = useState(false);
  const [date, setDate] = useState(new Date());
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [edit, setEdit] = useState(false);
  const [buttonToggle, setButtonToggle] = useState("Light"); // Button toggle
  const [selectedDate, setSelectedDate] = useState(
    moment(date).format("DD-MM-YYYY")
  );
  const [isTimeStartPickerVisible, setTimeStartPickerVisibility] =
    useState(false);
  const [selectedStartTime, setSelectedStartTime] = useState(null);
  const [isTimeEndPickerVisible, setTimeEndPickerVisibility] = useState(false);
  const [selectedEndTime, setSelectedEndTime] = useState(null);
  const [courseCode, setCourseCode] = useState(null);
  const [faculty, setFaculty] = useState(null);
  const [building, setBuilding] = useState(null);
  const [room, setRoom] = useState(null);
  const [note, setNote] = useState(null); // New note state
  const [repeatEveryWeekday, setRepeatEveryWeekday] = useState(false);
  const [courseItems, setCourseItems] = useState([]);
  const [courseId, setCourseId] = useState(null);

  useEffect(() => {
    registerForPushNotificationsAsync();

    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log(notification);
      }
    );

    return () => subscription.remove();
  }, []);

  const registerForPushNotificationsAsync = async () => {
    let token;
    if (Constants.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (finalStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        alert("Failed to get push token for push notification!");
        return;
      }
      token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log(token);
    } else {
      alert("Must use physical device for Push Notifications");
    }

    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    return token;
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    setSelectedDate(moment(date).format("DD-MM-YYYY"));
    hideDatePicker();
  };

  const showTimeStartPicker = () => {
    setTimeStartPickerVisibility(true);
  };

  const hideTimeStartPicker = () => {
    setTimeStartPickerVisibility(false);
  };

  const handleTimeStartConfirm = (time) => {
    time = new Date(time).toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
    setSelectedStartTime(time);
    hideTimeStartPicker();
  };

  const showTimeEndPicker = () => {
    setTimeEndPickerVisibility(true);
  };

  const hideTimeEndPicker = () => {
    setTimeEndPickerVisibility(false);
  };

  const handleTimeEndConfirm = (time) => {
    time = new Date(time).toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
    setSelectedEndTime(time);
    hideTimeEndPicker();
  };

  useEffect(() => {
    handleRoutineRefresh();
  }, [selectedDate]);

  const handleRoutineRefresh = () => {
    const dayOfWeek = moment(selectedDate, "DD-MM-YYYY").format("dddd");

    db.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM class WHERE selectedDate='${selectedDate}' OR (repeatEveryWeekday=1 AND selectedDate<=?) ORDER BY selectedStartTime ASC`,
        [selectedDate],
        (txObj, resultSet) => {
          const allItems = resultSet.rows._array;
          const filteredItems = allItems.filter((item) => {
            if (item.repeatEveryWeekday) {
              const itemDayOfWeek = moment(
                item.selectedDate,
                "DD-MM-YYYY"
              ).format("dddd");
              return itemDayOfWeek === dayOfWeek;
            }
            return true;
          });
          setCourseItems(filteredItems);
        },
        (txObj, error) => console.log(error)
      );
    });
  };

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS class (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          courseCode TEXT,
          faculty TEXT,
          building TEXT,
          room TEXT,
          selectedStartTime TEXT,
          selectedEndTime TEXT,
          selectedDate TEXT,
          note TEXT,
          repeatEveryWeekday INTEGER,
          Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
        );`,
        [],
        (txObj, resultSet) => {
          console.log("success database", resultSet);
        },
        (txObj, error) => console.log(error)
      );

      handleRoutineRefresh();
    });
  }, []);

  const handleRoutineAdd = () => {
    if (edit === false) {
      db.transaction((tx) => {
        tx.executeSql(
          `INSERT INTO class (courseCode, faculty, building, room, selectedStartTime, selectedEndTime, selectedDate, note, repeatEveryWeekday)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            courseCode,
            faculty,
            building,
            room,
            selectedStartTime,
            selectedEndTime,
            selectedDate,
            note,
            repeatEveryWeekday ? 1 : 0,
          ],
          (txObj, resultSet) => {
            console.log("success insert", resultSet);
            scheduleNotification(
              courseCode,
              selectedStartTime,
              selectedDate,
              repeatEveryWeekday
            );
          },
          (txObj, error) => console.log(error)
        );
      });
    } else {
      db.transaction((tx) => {
        tx.executeSql(
          `UPDATE class SET courseCode=?, faculty=?, building=?, room=?, selectedStartTime=?, selectedEndTime=?, note=?, repeatEveryWeekday=? WHERE id=?`,
          [
            courseCode,
            faculty,
            building,
            room,
            selectedStartTime,
            selectedEndTime,
            note,
            repeatEveryWeekday ? 1 : 0,
            courseId,
          ],
          (txObj, resultSet) => {
            console.log("success update", resultSet);
            scheduleNotification(
              courseCode,
              selectedStartTime,
              selectedDate,
              repeatEveryWeekday
            );
          },
          (txObj, error) => console.log(error)
        );
      });

      setEdit(false);
    }
    handleRoutineRefresh();
    setVisible(false);
  };

  const scheduleNotification = (
    courseCode,
    startTime,
    date,
    repeatEveryWeekday
  ) => {
    const classStartTime = moment(
      `${date} ${startTime}`,
      "DD-MM-YYYY hh:mm A"
    ).toDate();
    const twoMinutesBefore = moment(classStartTime)
      .subtract(2, "minutes")
      .toDate();

    const now = new Date();

    if (twoMinutesBefore > now) {
      Notifications.scheduleNotificationAsync({
        content: {
          title: "Upcoming Class",
          body: `Your class ${courseCode} starts in 2 minutes!`,
        },
        trigger: repeatEveryWeekday
          ? {
              hour: twoMinutesBefore.getHours(),
              minute: twoMinutesBefore.getMinutes(),
              repeats: true,
            }
          : twoMinutesBefore,
      });
    } else {
      console.log(
        "2 minutes before notification time is in the past. Notification not scheduled."
      );
    }

    if (classStartTime > now) {
      Notifications.scheduleNotificationAsync({
        content: {
          title: "Class Reminder",
          body: `Your class ${courseCode} is starting now at Building:${building} room:${room}!`,
        },
        trigger: repeatEveryWeekday
          ? {
              hour: classStartTime.getHours(),
              minute: classStartTime.getMinutes(),
              repeats: true,
            }
          : classStartTime,
      });
    } else {
      console.log(
        "Class start notification time is in the past. Notification not scheduled."
      );
    }
  };

  const handleRoutineDelete = (id) => {
    db.transaction((tx) => {
      tx.executeSql(
        `DELETE FROM class WHERE id=?`,
        [id],
        (txObj, resultSet) => {
          handleRoutineRefresh();
        },
        (txObj, error) => console.log(error)
      );
    });
  };

  const handleRoutineEdit = (id) => {
    let EditItem = Object.values(courseItems).find((obj) => {
      return obj.id === id;
    });

    setCourseId(EditItem.id);
    setCourseCode(EditItem.courseCode);
    setFaculty(EditItem.faculty);
    setBuilding(EditItem.building);
    setRoom(EditItem.room);
    setSelectedStartTime(EditItem.selectedStartTime);
    setSelectedEndTime(EditItem.selectedEndTime);
    setNote(EditItem.note); // Set the note for editing
    setRepeatEveryWeekday(EditItem.repeatEveryWeekday === 1);

    setEdit(true);
    setVisible(true);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Class Routine</Text>
        </View>
        <TouchableOpacity onPress={handleRoutineRefresh}>
          <Calendar onSelectDate={setSelectedDate} selected={selectedDate} />
        </TouchableOpacity>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            justifyContent: "space-between",
            paddingHorizontal: 16,
            paddingVertical: 2,
          }}
        >
          <Text style={styles.subtitle}>{selectedDate}</Text>
          <View
            style={{
              width: wp(10),
              height: hp(3),
              border: 1,
              borderRadius: wp(15),
            }}
          >
            <TouchableOpacity
              style={{ color: "black" }}
              title="Show Date Picker"
              onPress={showDatePicker}
            >
              <View>
                <AntDesign name="calendar" size={24} color="black" />
              </View>
              <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={handleConfirm}
                onCancel={hideDatePicker}
              />
            </TouchableOpacity>
          </View>
        </View>
        <View
          style={{
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "flex-end",
            height: hp(54),
          }}
        >
          <ScrollView>
            {courseItems.map((courseItem, index) => {
              return (
                <View
                  key={index}
                  style={{
                    width: wp(94),
                    margin: wp(1),
                    marginHorizontal: wp(3),
                    padding: wp(4),
                    paddingHorizontal: wp(6),
                    flexDirection: "row",
                    justifyContent: "space-between",
                    backgroundColor: "#323232",
                    borderRadius: wp(5),
                  }}
                >
                  <View style={{ width: wp(60) }}>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text style={[styles.text]}>{courseItem.courseCode}</Text>
                      <Text style={[styles.text]}>B:{courseItem.building}</Text>
                      <Text style={[styles.text]}>
                        {courseItem.selectedStartTime}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text style={[styles.text]}>{courseItem.faculty}</Text>
                      <Text style={[styles.text]}>R: {courseItem.room}</Text>
                      <Text style={[styles.text]}>
                        {courseItem.selectedEndTime}
                      </Text>
                    </View>
                    <View>
                      <Text style={[styles.note]}>Note: {courseItem.note}</Text>
                    </View>
                  </View>
                  <View
                    style={{
                      marginHorizontal: wp(2),
                      padding: wp(2),
                      paddingHorizontal: wp(3),
                      width: wp(30),
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => handleRoutineEdit(courseItem.id)}
                    >
                      <FontAwesome name="edit" size={24} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleRoutineDelete(courseItem.id)}
                    >
                      <MaterialIcons
                        style={{ left: wp(-8) }}
                        name="delete"
                        size={24}
                        color="white"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={() => {
              setVisible(true);
              hideTimeStartPicker();
              hideTimeEndPicker();
            }}
          >
            <View style={styles.btn}>
              <Text style={styles.btnText}>ADD</Text>
            </View>
          </TouchableOpacity>
          <View style={{ backgroundColor: "#fff" }}>
            <Modal
              animationIn={"slideInUp"}
              animationOut={"slideOutDown"}
              isVisible={visible}
              onBackdropPress={() => {
                setVisible(false);
                setEdit(false);
              }}
              onBackButtonPress={() => {
                setVisible(false);
                setEdit(false);
              }}
            >
              <View
                style={{
                  flex: 1,
                  padding: 20,
                  position: "absolute",
                  bottom: -20,
                  left: -20,
                  backgroundColor: "#fff",
                  width: wp(100),
                  height: hp(60),
                  borderTopLeftRadius: wp(6),
                  borderTopRightRadius: wp(6),
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: wp(4),
                      fontWeight: "700",
                      marginBottom: hp(1),
                      padding: 1,
                    }}
                  >
                    {edit ? "Edit class on" : "Add Class on"} {selectedDate}
                  </Text>
                  <TouchableOpacity onPress={handleRoutineAdd}>
                    <Text
                      style={{
                        backgroundColor: "#141414",
                        color: "white",
                        padding: wp(1),
                        marginBottom: hp(1),
                        paddingHorizontal: wp(7),
                        borderWidth: 1,
                        borderRadius: wp(10),
                      }}
                    >
                      Done
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.flex_input}>
                  <Text style={styles.label}>Course Code</Text>
                  <TextInput
                    onChangeText={(text) => setCourseCode(text)}
                    value={courseCode}
                    style={styles.input}
                    placeholder="e.g.Cse 121"
                  />
                </View>
                <View style={styles.flex_input}>
                  <Text style={styles.label}>Faculty</Text>
                  <TextInput
                    onChangeText={(text) => setFaculty(text)}
                    value={faculty}
                    style={styles.input}
                    placeholder="e.g. MDI"
                  />
                </View>
                <View style={styles.flex_input}>
                  <Text style={styles.label}>Building</Text>
                  <TextInput
                    keyboardType="number-pad"
                    onChangeText={(text) => setBuilding(text)}
                    value={building}
                    style={styles.input}
                    placeholder="e.g. 2"
                  />
                </View>
                <View style={styles.flex_input}>
                  <Text style={styles.label}>Room No.</Text>
                  <TextInput
                    keyboardType="number-pad"
                    onChangeText={(text) => setRoom(text)}
                    value={room}
                    style={styles.input}
                    placeholder="e.g. 901"
                  />
                </View>
                <View style={styles.flex_input}>
                  <Text style={styles.label}>Note</Text>
                  <TextInput
                    onChangeText={(text) => setNote(text)}
                    value={note}
                    style={styles.input}
                    placeholder="e.g. Bring slides"
                  />
                </View>
                <View style={styles.flex_input}>
                  <Text style={styles.label}>Repeat Every Weekday</Text>
                  <Switch
                    onValueChange={() =>
                      setRepeatEveryWeekday((previousState) => !previousState)
                    }
                    value={repeatEveryWeekday}
                  />
                </View>
                <View style={[styles.flex_input, { marginTop: hp(1) }]}>
                  <Text style={styles.label}>Start Time</Text>
                  <TouchableOpacity
                    title="Show Time Picker"
                    onPress={showTimeStartPicker}
                  >
                    <Text
                      style={{
                        paddingHorizontal: wp(11),
                        padding: 1,
                        marginRight: wp(3),
                        borderColor: "#141414",
                        borderWidth: 1,
                        borderRadius: wp(10),
                      }}
                    >
                      {selectedStartTime ? selectedStartTime : "Time"}
                    </Text>
                  </TouchableOpacity>
                  <DateTimePickerModal
                    isVisible={isTimeStartPickerVisible}
                    mode="time"
                    display="spinner"
                    positiveButton={{ label: "OK", textColor: "green" }}
                    onConfirm={handleTimeStartConfirm}
                    onCancel={hideTimeStartPicker}
                  />
                </View>
                <View style={[styles.flex_input, { marginTop: hp(1) }]}>
                  <Text style={styles.label}>End Time</Text>
                  <TouchableOpacity
                    title="Show Time Picker"
                    onPress={showTimeEndPicker}
                  >
                    <Text
                      style={{
                        paddingHorizontal: wp(11),
                        padding: 1,
                        marginRight: wp(3),
                        borderColor: "#141414",
                        borderWidth: 1,
                        borderRadius: wp(10),
                      }}
                    >
                      {selectedEndTime ? selectedEndTime : "Time"}
                    </Text>
                  </TouchableOpacity>
                  <DateTimePickerModal
                    isVisible={isTimeEndPickerVisible}
                    mode="time"
                    display="spinner"
                    positiveButton={{ label: "OK", textColor: "green" }}
                    onConfirm={handleTimeEndConfirm}
                    onCancel={hideTimeEndPicker}
                  />
                </View>
              </View>
            </Modal>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Routine;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 24,
    backgroundColor: "#FDFDFD",
  },
  header: {
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1d1d1d",
    marginBottom: 12,
  },
  picker: {
    flex: 1,
    maxHeight: 74,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  subtitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#999999",
    marginBottom: 12,
  },
  footer: {
    marginTop: "auto",
    paddingHorizontal: 16,
  },
  item: {
    flex: 1,
    height: 50,
    marginHorizontal: 4,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#e3e3e3",
    flexDirection: "column",
    alignItems: "center",
  },
  itemRow: {
    width: width,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginHorizontal: -4,
  },
  itemWeekday: {
    fontSize: 13,
    fontWeight: "500",
    color: "#737373",
    marginBottom: 4,
  },
  itemDate: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    backgroundColor: "#007aff",
    borderColor: "#007aff",
  },
  btnText: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "600",
    color: "#fff",
  },
  input: {
    height: hp(4),
    width: wp(40),
    margin: wp(2),
    borderWidth: 1,
    borderRadius: 20,
    padding: wp(1),
    paddingLeft: wp(0),
    textAlign: "center",
  },
  flex_input: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    marginRight: wp(3),
    marginLeft: wp(3),
    fontWeight: "500",
  },
  text: {
    width: wp(20),
    color: "white",
    fontWeight: "500",
  },
  note: {
    width: wp(60),
    color: "white",
    fontWeight: "500",
  },
});
