import React from 'react';
import { StyleSheet, Text, View,FlatList,TextInput,TouchableOpacity } from 'react-native';
import db from "../config";
import {ScrollView} from "react-native-gesture-handler";
import { Transition } from 'react-native-reanimated';

export default class SearchScreens extends React.Component{
    constructor(props){
        super(props)
        this.state={
         allTransactions:[],
         lastVisibleTransaction:null,
         search:''
        }
    }

    fetchMoreTransaction=async()=>{
     var text=this.state.search.toUpperCase()
     var enteredText= text.split('')
     if(enteredText[0].toUpperCase()=='B'){
         const Query= await db.collection('transaction').where('bookID','==',text).startAfter(this.state.lastVisibleTransaction).limit(10).get()
         Query.docs.map((doc)=>{
             this.setState({
                 allTransactions:[...this.state.allTransactions,doc.data()],
                 lastVisibleTransaction:doc
             })
         })
     }
         else if(enteredText[0].toUpperCase()=='S'){
             const Query= await db.collection('transaction').where('studentID','==',text).startAfter(this.state.lastVisibleTransaction).limit(10).get()
             Query.docs.map((doc)=>{
                 this.setState({
                     allTransactions:[...this.state.allTransactions,doc.data()],
                     lastVisibleTransaction:doc
                 })
             })
         }
     
    }
     
    searchTransaction=async(text)=>{
    var enteredText= text.split('')
    if(enteredText[0].toUpperCase()=='B'){
        const transaction= await db.collection('transaction').where('bookID','==',text).get()
        transaction.docs.map((doc)=>{
            this.setState({
                allTransactions:[...this.state.allTransactions,doc.data()],
                lastVisibleTransaction:doc
            })
        })
        
    }
        else if(enteredText[0].toUpperCase()=='S'){
            const transaction= await db.collection('transaction').where('studentID','==',text).get()
            transaction.docs.map((doc)=>{
                this.setState({
                    allTransactions:[...this.state.allTransactions,doc.data()],
                    lastVisibleTransaction:doc
                })
            })
        }

    }
     
    componentDidMount=async()=>{
        const Query=await db.collection('transaction').limit(10).get()
        Query.docs.map((doc)=>{
            this.setState({
                allTransactions:[],
                lastVisibleTransaction:doc
            })
        })
    }

    render(){
        return(
            <View style={styles.container}>
                <View style={style.searchBar}>
                    <TextInput
                    style={styles.bar}
                    placeholder='Enter BookID or StudentID'
                    onChangeText={(text)=>{this.setState({
                        search:text
                    })}}/>
                </View>
            </View>
        )
    }
}