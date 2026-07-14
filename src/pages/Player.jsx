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

            .order("created_at", {
                ascending:true
            })

            .limit(1)
            .single();



        if(error){

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





    if(!video){

        return (

            <div

                style={{

                    width:"100vw",

                    height:"100vh",

                    background:"#000",

                    color:"#fff",

                    display:"flex",

                    justifyContent:"center",

                    alignItems:"center",

                    fontSize:"40px",

                    overflow:"hidden"

                }}

            >

                Waiting for video...

            </div>

        );

    }





    const id = getVideoId(video.url);



    return (

        <div

            style={{

                width:"100vw",

                height:"100vh",

                background:"#000",

                display:"flex",

                justifyContent:"center",

                alignItems:"center",

                overflow:"hidden"

            }}

        >

            <iframe

                src={
                    `https://www.youtube.com/embed/${id}?autoplay=1&controls=0`
                }

                title="stream-player"

                allow="
                    autoplay;
                    fullscreen
                "

                style={{

                    width:"100%",

                    height:"100%",

                    border:"none"

                }}

            />

        </div>

    );

}