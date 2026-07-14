import { useEffect, useState } from "react";
import supabase from "../lib/supabase";


function getVideoId(url) {

    try {

        const u = new URL(url);


        if (u.hostname.includes("youtu.be")) {

            return u.pathname.slice(1);

        }


        return u.searchParams.get("v");


    }

    catch {

        return null;

    }

}



export default function Player() {


    const [video, setVideo] = useState(null);



    async function loadVideo() {


        const { data, error } = await supabase

            .from("videos")

            .select("*")

            .eq("approved", true)

            .eq("played", false)

            .order(
                "created_at",
                {
                    ascending:true
                }
            )

            .limit(1)
            .single();



        if(error){

            console.log(error);

            setVideo(null);

            return;

        }


        setVideo(data);


    }





    useEffect(()=>{


        loadVideo();



        const channel = supabase

            .channel("player")

            .on(

                "postgres_changes",

                {

                    event:"*",

                    schema:"public",

                    table:"videos"

                },

                ()=>{

                    loadVideo();

                }

            )

            .subscribe();




        return ()=>{

            supabase.removeChannel(channel);

        };


    },[]);





    async function finished(){


        if(!video)
            return;



        await supabase

            .from("videos")

            .update({

                played:true

            })

            .eq(
                "id",
                video.id
            );



        loadVideo();


    }





    if(!video){

        return (

            <div
                style={{
                    background:"#000",
                    width:"100vw",
                    height:"100vh",
                    color:"#fff",
                    display:"flex",
                    alignItems:"center",
                    justifyContent:"center",
                    fontSize:40
                }}
            >

                Waiting for video...

            </div>

        );

    }





    const id =
        getVideoId(video.url);



    return (

        <iframe

            src={
                `https://www.youtube.com/embed/${id}?autoplay=1&controls=0`
            }

            title="player"

            style={{

                width:"100vw",

                height:"100vh",

                border:"none"

            }}

            allow="
                autoplay;
                fullscreen
            "

            onLoad={()=>{}}

        />

    );

}