import React from 'react';
import {
  StyleSheet,
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  Switch,
  TextInput,
} from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import Modal from "react-native-modal";
import db from '../../api/src/model/db';

import  { useState, useRef,useEffect } from 'react';



const SECTIONS = [

  /*
  {
    header: 'Content',
    items: [
      { id: 'save', icon: 'save', label: 'Saved', type: 'link' },
      { id: 'download', icon: 'download', label: 'Downloads', type: 'link' },
    ],
  },
  */
  {
    header: 'Help',
    items: [
      { id: 'contact', icon: 'mail', label: 'Contact Us', type: 'link' },
    ],
  },
];
const Profile = () => {
  const [form, setForm] = useState({
    language: 'English',
    darkMode: true,
    wifi: false,
  });


  const [visible,setVisible]=useState(false);
  const [name,setName]=useState(false);


  useEffect(() => {
            
    db.transaction(tx => {
      tx.executeSql(`CREATE TABLE IF NOT EXISTS class_user (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user TEXT,
        Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
    );`),
      (txObj, resultSet) => {console.log("success database", resultSet)},
      (txObj, error) => console.log(error)
    });

        db.transaction(tx => {
            tx.executeSql(`SELECT user FROM class_user`, null,
                (txObj, resultSet) => {
                  if (resultSet.rows.length > 0) {
                    const firstRow = resultSet.rows.item(0);
                    const { user } = firstRow;
                    setName(user);
                }else{
                  db.transaction(tx => {
                    tx.executeSql(`INSERT INTO class_user(user)
                    VALUES ('JOHN DOE')
                    `, null,
                      (txObj, resultSet) => {console.log("success insert", resultSet)},
                      (txObj, error) => console.log(error)
                    );
                  });
                } 
                
                },
                (txObj, error) => console.log(error)
            );
        });
        
        
  }, [db]);


  const handleProfileDone=()=>{
    

    db.transaction(tx => {
      tx.executeSql(`update class_user set user='${name}'`, null,
          (txObj, resultSet) => {},
          (txObj, error) => console.log(error)
      );
  });

  }



  


  return (
    <SafeAreaView style={{ backgroundColor: '#f6f6f6' }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>

          <Text style={styles.subtitle}>
            
          </Text>
        </View>

        <View style={styles.profile}>
          <Image
            alt=""
            source={{
              uri: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2.5&w=256&h=256&q=80',
            }}
            style={styles.profileAvatar} />

          <Text style={styles.profileName}>{(name) ? name :"JOHN DOE"}</Text>

          {
            //<Text style={styles.profileEmail}>john.doe@mail.com</Text>
          }

          <TouchableOpacity
            onPress={() => {
              setVisible(true)
            }}>
            <View style={styles.profileAction} >
              <Text style={styles.profileActionText} >Edit Profile</Text>

              <FeatherIcon color="#fff" name="edit" size={16} />
            </View>
          </TouchableOpacity>
        </View>

        {SECTIONS.map(({ header, items }) => (
          <View style={styles.section} key={header}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>{header}</Text>
            </View>
            <View style={styles.sectionBody}>
              {items.map(({ id, label, icon, type, value }, index) => {
                return (
                  <View
                    key={id}
                    style={[
                      styles.rowWrapper,
                      index === 0 && { borderTopWidth: 0 },
                    ]}>
                    <TouchableOpacity
                      onPress={() => {
                        // handle onPress
                      }}>
                      <View style={styles.row}>
                        <FeatherIcon
                          color="#616161"
                          name={icon}
                          style={styles.rowIcon}
                          size={22} />

                        <Text style={styles.rowLabel}>{label}</Text>

                        <View style={styles.rowSpacer} />

                        {type === 'select' && (
                          <Text style={styles.rowValue}>{form[id]}</Text>
                        )}

                        {type === 'toggle' && (
                          <Switch
                            onChange={val => setForm({ ...form, [id]: val })}
                            value={form[id]}
                          />
                        )}

                        {(type === 'select' || type === 'link') && (
                          <FeatherIcon
                            color="#ababab"
                            name="chevron-right"
                            size={22} />
                        )}
                      </View>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>



      <View style={{ backgroundColor:'#fff'}}>
                        <Modal animationIn={'slideInUp'} animationOut={'slideOutDown'} isVisible={visible}  onBackdropPress={()=>{ setVisible(false)}} onBackButtonPress={()=>{ setVisible(false)}}>
                            <View style={{ flex: 1 ,padding:20, position:'absolute',bottom:-20,left:-20,backgroundColor:'#fff',width:wp(100),height:hp(50),borderTopLeftRadius:wp(6),borderTopRightRadius:wp(6)}}>
                                <View style={{flexDirection:'row', justifyContent:'space-between',alignItems:'center'}}>
                                    <Text></Text>
                                    <TouchableOpacity onPress={handleProfileDone}>
                                        <Text style={[styles.flex_input,{ backgroundColor:"#141414",color:'white', padding:wp(1),marginBottom:hp(3), paddingHorizontal:wp(7),borderWidth: 1, borderRadius:wp(10)}]}>Done</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.flex_input}>
                                    <Text style={styles.label}>Name</Text>
                                    <TextInput onChangeText={text=>setName(text)}  style={styles.input}  placeholder="Enter Your Name"/>
                                </View>
                            </View>
                        </Modal>
                    </View>
    </SafeAreaView>
  );
}

export default Profile

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
  },
  header: {
    paddingLeft: 24,
    paddingRight: 24,
    marginBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1d1d1d',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#929292',
  },
  /** Profile */
  profile: {
    padding: 16,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e3e3e3',
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 9999,
  },
  profileName: {
    marginTop: 12,
    fontSize: 20,
    fontWeight: '600',
    color: '#090909',
  },
  profileEmail: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: '400',
    color: '#848484',
  },
  profileAction: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007bff',
    borderRadius: 12,
  },
  profileActionText: {
    marginRight: 8,
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  /** Section */
  section: {
    paddingTop: 12,
  },
  sectionHeader: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#a7a7a7',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  sectionBody: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e3e3e3',
  },
  /** Row */
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingRight: 24,
    height: 50,
  },
  rowWrapper: {
    paddingLeft: 24,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#e3e3e3',
  },
  rowIcon: {
    marginRight: 12,
  },
  rowLabel: {
    fontSize: 17,
    fontWeight: '500',
    color: '#000',
  },
  rowSpacer: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  rowValue: {
    fontSize: 17,
    color: '#616161',
    marginRight: 4,
  },
  flex_input:{
    flexDirection:"row",alignItems:"center",justifyContent:"space-between"
},
});