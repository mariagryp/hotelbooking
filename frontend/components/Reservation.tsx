"use client";

import { format, isPast } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "./ui/calendar";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { LoginLink } from "@kinde-oss/kinde-auth-nextjs/components";
import AlertMessage from "./AlertMessage";

import { useRouter } from "next/navigation";

interface AlertMessage {
  message: string;
  type: "error" | "success" | null;
}

const postData = async (url: string, data: object) => {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };
  try {
    const res = await fetch(url, options);
    const data = await res.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};

const Reservation = ({
  reservations,
  room,
  isUserAuthenticated,
  userData,
}: {
  reservations: any;
  room: any;
  isUserAuthenticated: boolean;
  userData: any;
}) => {
  const [checkInDate, setCheckInDate] = useState<Date>();
  const [checkOutDate, setCheckOutDate] = useState<Date>();
  const [alertMessage, setAlertMessage] = useState<AlertMessage | null>(null);

  const formatDataForStrapi = (date: Date) => {
    return format(date, "yyyy-MM-dd");
  };

  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      return setAlertMessage(null);
    }, 4000);
    //clear timer
    return () => clearTimeout(timer);
  }, [alertMessage]);

  /*   useState<{
    message: string;
    type: "error" | "success" | null;
  } | null>(null);
 */
  const saveReservation = () => {
    if (!checkInDate || !checkOutDate) {
      return setAlertMessage({
        message: "Please, select check-in and checkout dates",
        type: "error",
      });
    }
    if (checkInDate.getTime() === checkOutDate.getTime()) {
      return setAlertMessage({
        message: "Check-in and check-out dates cannot be the same!",
        type: "error",
      });
    }

    //filter reservations for the current room and check if any reservations overlaps with the selected dates
    const isReserved = reservations.data
      .filter(
        (item: any) => item.attributes.room.data.id === room.data.id
        //filter reservations for the current room
      )
      .some((item: any) => {
        //check if any reservation overlaps with the selected dates
        const existingCheckIn = new Date(item.attributes.checkIn).setHours(
          0,
          0,
          0,
          0
        ); // convert existing check in date into the midnight
        const existingCheckOut = new Date(item.attributes.checkOut).setHours(
          0,
          0,
          0,
          0
        ); // convert existing check out date into the midnight

        //convert selected check in date to midnight
        const checkInTime = checkInDate.setHours(0, 0, 0, 0);
        //convert selected checkout date to midnight
        const checkOutTime = checkOutDate.setHours(0, 0, 0, 0);

        // check if the room is reserved/available btw the check in and check out dates
        const isReservedBetweenDates =
          (checkInTime >= existingCheckIn && checkInTime < existingCheckOut) ||
          (checkOutTime > existingCheckIn &&
            checkOutTime <= existingCheckOut) ||
          (existingCheckIn > checkInTime && existingCheckIn < checkOutTime) ||
          (existingCheckOut > checkInTime && existingCheckOut <= checkOutTime);

        return isReservedBetweenDates; // return true if any  reservatin overlaps with the selected dates
      });

    //if the room is reserved_ provide the message. Otherwise proceed with booking
    if (isReserved) {
      setAlertMessage({
        message:
          "This room is already booked for the selected dates. Please, choose another dates or another room.",
        type: "error",
      });
    } else {
      //real data
      const data = {
        data: {
          firstname: userData.family_name,
          lastname: userData.given_name,
          email: userData.email,
          checkIn: checkInDate ? formatDataForStrapi(checkInDate) : null, // format selected check in date
          checkOut: checkOutDate ? formatDataForStrapi(checkOutDate) : null, //format selected checkout date
          room: room.data.id,
        },
      };
      //post booking data in to the server
      postData("http://127.0.0.1:1337/api/reservations", data);
      setAlertMessage({
        message:
          "Your room has been successfully confirmed! We look forward to welcoming you on your selected dates!",
        type: "success",
      });
      //refresh the page to reflect the updates reservation status
      router.refresh();
    }
  };

  return (
    <div>
      <div className="bg-tertiary h-[320px] mb-4  ">
        {/* top */}
        <div className="bg-accent py-4 text-center relative mb-2 ">
          <h4 className="text-xl text-white">Book your rooms</h4>
          {/* triangle */}
          <div className="absolute -bottom-[8px] left-[calc(50%_-_10px)] w-0 h-0 border-l-[10px] border-l-transparent border-t-[8px] border-t-accent border-r-[10px] border-r-transparent "></div>
        </div>
        <div className="flex flex-col gap-4 w-full py-6 px-8  ">
          {/* check in */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="default"
                size="md"
                className={cn(
                  "w-full flex justify-start text-left font-semibold",
                  !checkInDate && "text-secondary"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {checkInDate ? (
                  format(checkInDate, "PPP")
                ) : (
                  <span>Check in</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={checkInDate}
                onSelect={setCheckInDate}
                initialFocus
                disabled={isPast}
              />
            </PopoverContent>
          </Popover>
          {/* check out */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="default"
                size="md"
                className={cn(
                  "w-full flex justify-start text-left font-semibold",
                  !checkOutDate && "text-secondary"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {checkOutDate ? (
                  format(checkOutDate, "PPP")
                ) : (
                  <span>Check out</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={checkOutDate}
                onSelect={setCheckOutDate}
                initialFocus
                disabled={isPast}
              />
            </PopoverContent>
          </Popover>
          {/* conditional rendering of the booking button based on an user authentication status. If the user is authenticated, display a 'Book now' button with an onClick event handler to save the booking. If the user is not authenticated, display a 'Book now' button wrapped inside a login link. */}
          {isUserAuthenticated ? (
            <Button onClick={() => saveReservation()} size="md">
              Book now
            </Button>
          ) : (
            <LoginLink>
              <Button className="w-full" size="md">
                Book now
              </Button>
            </LoginLink>
          )}
        </div>
      </div>
      {alertMessage && (
        <AlertMessage message={alertMessage.message} type={alertMessage.type} />
      )}
    </div>
  );
};

export default Reservation;
