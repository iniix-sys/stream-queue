import supabase from "./supabase";


export async function getUser(){

    const {
        data
    } = await supabase.auth.getUser();


    return data.user;

}


export async function login(email,password){

    return await supabase.auth.signInWithPassword({

        email,

        password

    });

}


export async function logout(){

    return await supabase.auth.signOut();

}